package com.nutech.email.controller;

import com.microsoft.graph.models.Message;
import com.microsoft.graph.models.Recipient;
import com.nutech.email.integration.GraphMailService;
import com.nutech.email.service.EmailProcessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.microsoft.graph.models.Attachment;
import com.microsoft.graph.models.FileAttachment;

@RestController
@RequestMapping("/api/inbox")
@RequiredArgsConstructor
public class EmailInboxController {

    private final GraphMailService graphMailService;
    private final EmailProcessorService emailProcessorService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getInbox(@RequestParam(defaultValue = "20") int limit) {
        List<Message> messages = graphMailService.fetchRecentEmails(limit);
        
        List<Map<String, Object>> result = messages.stream().map(msg -> {
            String from = (msg.getFrom() != null && msg.getFrom().getEmailAddress() != null)
                    ? msg.getFrom().getEmailAddress().getAddress() : "Unknown";
            String fromName = (msg.getFrom() != null && msg.getFrom().getEmailAddress() != null)
                    ? msg.getFrom().getEmailAddress().getName() : "Unknown";
                    
            // Extract TO recipients
            String to = "";
            String toName = "";
            if (msg.getToRecipients() != null && !msg.getToRecipients().isEmpty()) {
                to = msg.getToRecipients().stream()
                        .filter(r -> r.getEmailAddress() != null && r.getEmailAddress().getAddress() != null)
                        .map(r -> r.getEmailAddress().getAddress())
                        .collect(Collectors.joining(", "));
                toName = msg.getToRecipients().stream()
                        .filter(r -> r.getEmailAddress() != null && r.getEmailAddress().getName() != null)
                        .map(r -> r.getEmailAddress().getName())
                        .collect(Collectors.joining(", "));
            }
                    
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
            
            // Use HashMap to allow more than 10 entries (Map.of limit)
            Map<String, Object> emailMap = new HashMap<>();
            emailMap.put("id", msg.getId());
            emailMap.put("subject", msg.getSubject() != null ? msg.getSubject() : "(No Subject)");
            emailMap.put("from", from);
            emailMap.put("fromName", fromName);
            emailMap.put("to", to);
            emailMap.put("toName", toName);
            emailMap.put("receivedAt", msg.getReceivedDateTime() != null ? msg.getReceivedDateTime().toString() : "");
            emailMap.put("preview", msg.getBodyPreview() != null ? msg.getBodyPreview() : "");
            emailMap.put("body", bodyContent);
            emailMap.put("category", category);
            emailMap.put("isRead", msg.getIsRead() != null ? msg.getIsRead() : true);
            emailMap.put("hasAttachments", msg.getHasAttachments() != null ? msg.getHasAttachments() : false);
            return emailMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        graphMailService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync-to-workitems")
    public ResponseEntity<Map<String, Object>> syncToWorkItems() {
        int synced = emailProcessorService.syncAllRecentEmails();
        return ResponseEntity.ok(Map.of("synced", synced, "message", synced + " emails synced to work items"));
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<Map<String, Object>>> getAttachments(@PathVariable String id) {
        List<Attachment> attachments = graphMailService.getAttachments(id);
        List<Map<String, Object>> result = attachments.stream().map(att -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", att.getId());
            map.put("name", att.getName());
            map.put("size", att.getSize());
            map.put("contentType", att.getContentType());
            map.put("isInline", att.getIsInline());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable String id, @PathVariable String attachmentId) {
        List<Attachment> attachments = graphMailService.getAttachments(id);
        Optional<Attachment> attachment = attachments.stream()
                .filter(a -> a.getId().equals(attachmentId))
                .findFirst();

        if (attachment.isPresent() && attachment.get() instanceof FileAttachment) {
            FileAttachment fileAtt = (FileAttachment) attachment.get();
            byte[] content = fileAtt.getContentBytes();
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileAtt.getName() + "\"")
                    .contentType(MediaType.parseMediaType(fileAtt.getContentType()))
                    .body(content);
        }
        return ResponseEntity.notFound().build();
    }
}
