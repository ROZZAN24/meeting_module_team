package com.nutech.email.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutech.email.dto.AiDto.*;
import com.nutech.email.model.MasterPart;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AiClient {

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${openai.max-tokens:4096}")
    private int maxTokens;

    @Value("${openai.temperature:0.1}")
    private double temperature;

    private WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // ─── INTENT CLASSIFICATION ───
    @Async("taskExecutor")
    public CompletableFuture<IntentResult> classifyIntent(String emailText) {
        String systemPrompt = """
            You are an email classifier for a manufacturing company. Classify the email into exactly one category:
            
            - "quotation_request": Customer is asking for a price quote / quotation for parts or products.
            - "invoice_request": Customer is requesting an invoice for an order already placed or agreed upon.
            - "general_inquiry": Customer has a general question (delivery status, product info, etc.) but is NOT requesting a quote or invoice.
            - "spam": Irrelevant, marketing, or junk email.
            
            Respond with ONLY a JSON object:
            {"intent": "<category>", "confidence": <0.0-1.0>, "reasoning": "<brief explanation>"}
            """;

        String userPrompt = "Classify this email:\n\n" + truncate(emailText, 3000);

        try {
            String response = callOpenAi(systemPrompt, userPrompt);
            IntentResult result = objectMapper.readValue(response, IntentResult.class);
            log.info("Intent classified: {} (confidence: {})", result.getIntent(), result.getConfidence());
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            log.error("Intent classification failed: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(
                    IntentResult.builder().intent("general_inquiry").confidence(0.0).reasoning("AI call failed").build()
            );
        }
    }

    // ─── PART CODE EXTRACTION ───
    @Async("taskExecutor")
    public CompletableFuture<List<ExtractedPart>> extractParts(String combinedText) {
        String systemPrompt = """
            You are a part-code extractor for a manufacturing company. From the given text (email body + OCR), extract all part codes, quantities, and related info.
            
            Part codes are typically alphanumeric like "ABC-1234", "NUT-M8", "FLG-200", "BRG-6205-2RS".
            
            Return a JSON array of objects. Each object must have:
            - "partCode": the part code string
            - "quantity": integer (default 1 if not specified)
            - "deliveryDate": requested delivery date if mentioned, else null
            - "specialInstructions": any special notes for this part, else null
            - "surroundingContext": the sentence or phrase where this part code was found
            
            Examples:
            Input: "Please quote for 50 nos of ABC-1234 and 100 pcs BRG-6205. Need by 15th March."
            Output: [
              {"partCode": "ABC-1234", "quantity": 50, "deliveryDate": "2025-03-15", "specialInstructions": null, "surroundingContext": "50 nos of ABC-1234"},
              {"partCode": "BRG-6205", "quantity": 100, "deliveryDate": "2025-03-15", "specialInstructions": null, "surroundingContext": "100 pcs BRG-6205"}
            ]
            
            If no part codes are found, return an empty array: []
            Respond with ONLY the JSON array, no extra text.
            """;

        String userPrompt = "Extract parts from:\n\n" + truncate(combinedText, 4000);

        try {
            String response = callOpenAi(systemPrompt, userPrompt);
            List<ExtractedPart> parts = objectMapper.readValue(response, new TypeReference<>() {});
            log.info("Extracted {} parts from text", parts.size());
            return CompletableFuture.completedFuture(parts);
        } catch (Exception e) {
            log.error("Part extraction failed: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(Collections.emptyList());
        }
    }

    // ─── UNKNOWN PART MATCHING ───
    @Async("taskExecutor")
    public CompletableFuture<PartMatchSuggestion> suggestPartMatch(String unknownCode,
                                                                     String context,
                                                                     List<MasterPart> masterParts) {
        String partsListStr = masterParts.stream()
                .map(p -> String.format("- %s: %s (%s)", p.getPartCode(), p.getPartName(),
                        p.getDescription() != null ? p.getDescription() : ""))
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
            You are a part-matching expert for a manufacturing company. A customer used a part code that doesn't exist in our database. 
            You must suggest the most likely match from our master parts list.
            
            Consider:
            - Alphanumeric similarity (typos, abbreviations, different naming conventions)
            - Context clues from the surrounding text
            - Industry knowledge about part naming
            
            Respond with ONLY a JSON object:
            {
              "unknownCode": "<the unknown code>",
              "suggestedPartCode": "<best matching master part code, or null if no match>",
              "confidence": <0.0-1.0>,
              "reasoning": "<explain why this is the best match>"
            }
            
            If confidence is below 0.3, set suggestedPartCode to null.
            """;

        String userPrompt = String.format(
                "Unknown code: \"%s\"\nContext: \"%s\"\n\nMaster Parts:\n%s",
                unknownCode, truncate(context, 500), truncate(partsListStr, 3000)
        );

        try {
            String response = callOpenAi(systemPrompt, userPrompt);
            PartMatchSuggestion suggestion = objectMapper.readValue(response, PartMatchSuggestion.class);
            log.info("Part match suggestion for '{}': {} (confidence: {})",
                    unknownCode, suggestion.getSuggestedPartCode(), suggestion.getConfidence());
            return CompletableFuture.completedFuture(suggestion);
        } catch (Exception e) {
            log.error("Part matching failed for '{}': {}", unknownCode, e.getMessage(), e);
            return CompletableFuture.completedFuture(
                    PartMatchSuggestion.builder()
                            .unknownCode(unknownCode)
                            .confidence(0.0)
                            .reasoning("AI call failed")
                            .build()
            );
        }
    }

    // ─── OpenAI API Call ───
    private String callOpenAi(String systemPrompt, String userPrompt) {
        Map<String, Object> request = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "temperature", temperature,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        String responseBody = webClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenAI response", e);
        }
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }
}
