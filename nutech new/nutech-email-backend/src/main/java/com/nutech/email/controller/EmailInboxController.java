package com.nutech.email.controller;

import com.microsoft.graph.models.Message;
import com.nutech.email.integration.GraphMailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inbox")
@RequiredArgsConstructor
public class EmailInboxController {

    private final GraphMailService graphMailService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getInbox(@RequestParam(defaultValue = "20") int limit) {
        List<Message> messages = graphMailService.fetchRecentEmails(limit);
        
        List<Map<String, Object>> result = messages.stream().map(msg -> {
            String from = (msg.getFrom() != null && msg.getFrom().getEmailAddress() != null)
                    ? msg.getFrom().getEmailAddress().getAddress() : "Unknown";
            String fromName = (msg.getFrom() != null && msg.getFrom().getEmailAddress() != null)
                    ? msg.getFrom().getEmailAddress().getName() : "Unknown";
                    
            String bodyContent = (msg.getBody() != null && msg.getBody().getContent() != null)
                    ? msg.getBody().getContent() : "";

            // Keyword based classification
            String subjectAndBody = (msg.getSubject() + " " + msg.getBodyPreview()).toLowerCase();
            String category = "Others";
            if (subjectAndBody.contains("ledger") || subjectAndBody.contains("statement") || subjectAndBody.contains("balance") || subjectAndBody.contains("account")) {
                category = "Ledger";
            } else if (subjectAndBody.contains("po") || subjectAndBody.contains("order") || subjectAndBody.contains("purchase")) {
                category = "Order";
            } else if (subjectAndBody.contains("quote") || subjectAndBody.contains("quotation") || subjectAndBody.contains("price") || subjectAndBody.contains("enquiry") || subjectAndBody.contains("inquiry")) {
                category = "Enquiry";
            }
                    
            return Map.<String, Object>of(
                "id", msg.getId(),
                "subject", msg.getSubject() != null ? msg.getSubject() : "(No Subject)",
                "from", from,
                "fromName", fromName,
                "receivedAt", msg.getReceivedDateTime() != null ? msg.getReceivedDateTime().toString() : "",
                "preview", msg.getBodyPreview() != null ? msg.getBodyPreview() : "",
                "body", bodyContent,
                "category", category,
                "isRead", msg.getIsRead() != null ? msg.getIsRead() : true,
                "hasAttachments", msg.getHasAttachments() != null ? msg.getHasAttachments() : false
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        graphMailService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
