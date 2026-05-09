package com.nutech.email.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.graph.models.Message;
import com.microsoft.graph.models.Attachment;
import com.microsoft.graph.models.FileAttachment;
import com.nutech.email.dto.AiDto.IntentResult;
import com.nutech.email.dto.AiDto.ExtractedPart;
import com.nutech.email.integration.AiClient;
import com.nutech.email.integration.GraphMailService;
import com.nutech.email.model.*;
import com.nutech.email.model.ProcessingRequest.Intent;
import com.nutech.email.model.ProcessingRequest.ProcessingStatus;
import com.nutech.email.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailProcessorService {

    private final GraphMailService graphService;
    private final OcrService ocrService;
    private final AiClient aiClient;
    private final PartResolutionService partResolutionService;
    private final DocumentService documentService;
    private final TemplateEngine templateEngine;
    private final ObjectMapper objectMapper;
    private final ProcessingRequestRepository processingRequestRepository;
    private final CustomerRepository customerRepository;
    private final EmailProcessingLogRepository logRepository;

    @Scheduled(fixedDelayString = "${email.poll.interval-ms:60000}", initialDelay = 10000)
    public void pollMailbox() {
        log.info("Polling shared mailbox for unread emails...");
        List<Message> emails = graphService.fetchUnreadEmails(10);
        log.info("Found {} unread emails", emails.size());
        for (Message email : emails) {
            try {
                if (processingRequestRepository.existsByEmailMessageId(email.getId())) continue;
                processEmail(email);
            } catch (Exception e) {
                log.error("Failed to process email '{}': {}", email.getSubject(), e.getMessage(), e);
            }
        }
    }

    @Transactional
    public void processEmail(Message email) {
        String messageId = email.getId();
        String senderEmail = (email.getFrom() != null && email.getFrom().getEmailAddress() != null) 
                             ? email.getFrom().getEmailAddress().getAddress() : "";

        ProcessingRequest request = ProcessingRequest.builder()
                .emailMessageId(messageId)
                .emailSubject(email.getSubject())
                .emailFrom(senderEmail)
                .emailBodyPreview(email.getBody() != null ? email.getBody().getContent() : "")
                .emailReceivedAt(LocalDateTime.now())
                .status(ProcessingStatus.RECEIVED)
                .build();
        
        customerRepository.findByEmailIgnoreCase(senderEmail).ifPresent(request::setCustomer);
        request = processingRequestRepository.save(request);
        logStep(request, "RECEIVED", EmailProcessingLog.LogStatus.SUCCESS, "Email saved");

        try {
            // OCR
            request.setStatus(ProcessingStatus.OCR_IN_PROGRESS);
            processingRequestRepository.save(request);
            String emailBody = email.getBody() != null ? email.getBody().getContent() : "";
            String attachmentText = extractAttachmentText(messageId);
            String combinedText = emailBody + "\n\n--- Attachments ---\n" + attachmentText;
            request.setCombinedText(combinedText);

            // Classify
            request.setStatus(ProcessingStatus.CLASSIFYING);
            processingRequestRepository.save(request);
            IntentResult intentResult = aiClient.classifyIntent(combinedText).get();
            Intent intent = mapIntent(intentResult.getIntent());
            request.setIntent(intent);

            if (intent != Intent.QUOTATION_REQUEST && intent != Intent.INVOICE_REQUEST) {
                request.setStatus(ProcessingStatus.SKIPPED);
                processingRequestRepository.save(request);
                graphService.markAsRead(messageId);
                return;
            }

            // Extract parts
            request.setStatus(ProcessingStatus.EXTRACTING);
            processingRequestRepository.save(request);
            List<ExtractedPart> parts = aiClient.extractParts(combinedText).get();
            request.setExtractedPartsJson(objectMapper.writeValueAsString(parts));
            if (parts.isEmpty()) {
                request.setStatus(ProcessingStatus.FAILED);
                request.setErrorMessage("No part codes found");
                processingRequestRepository.save(request);
                graphService.markAsRead(messageId);
                return;
            }

            // Resolve parts
            request.setStatus(ProcessingStatus.RESOLVING_PARTS);
            processingRequestRepository.save(request);
            Customer customer = request.getCustomer();
            if (customer == null) {
                customer = createOrGetCustomer(senderEmail, email);
                request.setCustomer(customer);
            }
            var resolution = partResolutionService.resolveParts(parts, customer, request);

            if (!resolution.allResolved()) {
                request.setStatus(ProcessingStatus.AWAITING_REVIEW);
                processingRequestRepository.save(request);
                graphService.markAsRead(messageId);
                return;
            }

            generateAndSend(request, customer, resolution.resolved(), messageId);
        } catch (Exception e) {
            log.error("Pipeline failed for email {}: {}", email.getSubject(), e.getMessage(), e);
            request.setStatus(ProcessingStatus.FAILED);
            request.setErrorMessage(e.getMessage());
            processingRequestRepository.save(request);
        }
    }

    @Transactional
    public void resumeAfterReview(ProcessingRequest request,
                                   List<PartResolutionService.ResolvedPartInfo> allResolved) {
        try {
            generateAndSend(request, request.getCustomer(), allResolved, request.getEmailMessageId());
        } catch (Exception e) {
            request.setStatus(ProcessingStatus.FAILED);
            request.setErrorMessage(e.getMessage());
            processingRequestRepository.save(request);
        }
    }

    private void generateAndSend(ProcessingRequest request, Customer customer,
                                  List<PartResolutionService.ResolvedPartInfo> resolvedParts, String messageId) {
        request.setStatus(ProcessingStatus.GENERATING_DOCUMENT);
        processingRequestRepository.save(request);
        Quotation quotation = documentService.generateQuotation(customer, request, resolvedParts, null);

        request.setStatus(ProcessingStatus.SENDING_REPLY);
        processingRequestRepository.save(request);
        byte[] pdfBytes = documentService.renderQuotationPdf(quotation);
        String replyHtml = buildReplyHtml(customer, quotation);
        graphService.sendReplyWithAttachment(messageId, request.getEmailSubject(),
                replyHtml, pdfBytes, quotation.getQuotationNumber() + ".pdf");

        quotation.setStatus(Quotation.QuotationStatus.SENT);
        quotation.setSentAt(LocalDateTime.now());
        graphService.moveToProcessedFolder(messageId);
        request.setStatus(ProcessingStatus.COMPLETED);
        processingRequestRepository.save(request);
        logStep(request, "COMPLETED", EmailProcessingLog.LogStatus.SUCCESS, "Done: " + quotation.getQuotationNumber());
    }

    private String extractAttachmentText(String messageId) {
        List<Attachment> attachments = graphService.getAttachments(messageId);
        StringBuilder text = new StringBuilder();
        for (Attachment att : attachments) {
            if (att instanceof FileAttachment fa) {
                byte[] content = fa.getContentBytes();
                String name = fa.getName() != null ? fa.getName().toLowerCase() : "";
                try {
                    CompletableFuture<String> f;
                    if (name.endsWith(".pdf")) f = ocrService.extractTextFromPdf(content);
                    else if (name.matches(".*\\.(jpg|jpeg|png)$")) f = ocrService.extractTextFromImage(content);
                    else continue;
                    text.append(f.get()).append("\n");
                } catch (Exception e) {
                    log.error("Attachment extraction failed for {}: {}", name, e.getMessage());
                }
            }
        }
        return text.toString();
    }

    private Customer createOrGetCustomer(String email, Message msg) {
        return customerRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            String name = (msg.getFrom() != null && msg.getFrom().getEmailAddress() != null)
                    ? msg.getFrom().getEmailAddress().getName() : email;
            return customerRepository.save(Customer.builder().email(email).name(name != null ? name : email).build());
        });
    }

    private String buildReplyHtml(Customer customer, Quotation quotation) {
        Context ctx = new Context();
        ctx.setVariable("customerName", customer.getName());
        ctx.setVariable("quotationNumber", quotation.getQuotationNumber());
        ctx.setVariable("totalAmount", quotation.getTotalAmount());
        ctx.setVariable("validUntil", quotation.getValidUntil());
        return templateEngine.process("email-reply-template", ctx);
    }

    private Intent mapIntent(String s) {
        if (s == null) return Intent.GENERAL_INQUIRY;
        return switch (s.toLowerCase()) {
            case "quotation_request" -> Intent.QUOTATION_REQUEST;
            case "invoice_request" -> Intent.INVOICE_REQUEST;
            case "spam" -> Intent.SPAM;
            default -> Intent.GENERAL_INQUIRY;
        };
    }

    private void logStep(ProcessingRequest r, String step, EmailProcessingLog.LogStatus s, String d) {
        logRepository.save(EmailProcessingLog.builder().processingRequest(r).step(step).status(s).details(d).build());
    }
}
