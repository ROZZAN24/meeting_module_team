package com.autonoma.erp.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Service
public class GroqService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GroqService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String generateResponse(String prompt, String context) {
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            return "Groq API Key is not configured. Please add groq.api.key to application.properties.";
        }

        try {
            Map<String, Object> requestBodyMap = new HashMap<>();
            requestBodyMap.put("model", "llama-3.3-70b-versatile");
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", context);
            messages.add(systemMessage);
            
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            messages.add(userMessage);
            
            requestBodyMap.put("messages", messages);
            requestBodyMap.put("temperature", 0.7);

            String requestBodyStr = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyStr))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "Error from Groq API (Status " + response.statusCode() + "): " + response.body();
            }

            Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
            if (responseMap != null && responseMap.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    if (message != null && message.containsKey("content")) {
                        return (String) message.get("content");
                    }
                }
            }
            return "Sorry, I couldn't generate a response.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling Groq API: " + e.getMessage();
        }
    }
}
