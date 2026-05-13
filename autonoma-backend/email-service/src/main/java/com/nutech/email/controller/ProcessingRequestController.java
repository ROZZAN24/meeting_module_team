package com.nutech.email.controller;

import com.nutech.email.model.EmailProcessingLog;
import com.nutech.email.model.ProcessingRequest;
import com.nutech.email.repository.EmailProcessingLogRepository;
import com.nutech.email.repository.InvoiceRepository;
import com.nutech.email.repository.ProcessingRequestRepository;
import com.nutech.email.repository.QuotationRepository;
import com.nutech.email.service.EmailProcessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/processing-requests")
@RequiredArgsConstructor
public class ProcessingRequestController {

    private final ProcessingRequestRepository prRepository;
    private final EmailProcessingLogRepository logRepository;
    private final QuotationRepository quotationRepository;
    private final InvoiceRepository invoiceRepository;
    private final EmailProcessorService emailProcessorService;
    private final com.nutech.email.repository.CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        List<Map<String, Object>> list = prRepository.findAll().stream()
                .map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return prRepository.findById(id)
                .map(pr -> ResponseEntity.ok(toDetailMap(pr)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        ProcessingRequest pr = new ProcessingRequest();
        updateFromMap(pr, body);
        pr = prRepository.save(pr);
        return ResponseEntity.ok(toDetailMap(pr));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return prRepository.findById(id)
                .map(pr -> {
                    updateFromMap(pr, body);
                    pr = prRepository.save(pr);
                    return ResponseEntity.ok(toDetailMap(pr));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (prRepository.existsById(id)) {
            prRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void updateFromMap(ProcessingRequest pr, Map<String, Object> body) {
        if (body.containsKey("emailSubject")) pr.setEmailSubject((String) body.get("emailSubject"));
        if (body.containsKey("emailFrom")) pr.setEmailFrom((String) body.get("emailFrom"));
        if (body.containsKey("emailTo")) pr.setEmailTo((String) body.get("emailTo"));
        if (body.containsKey("emailBodyPreview")) pr.setEmailBodyPreview((String) body.get("emailBodyPreview"));
        
        if (body.containsKey("category")) {
            String cat = (String) body.get("category");
            if ("Enquiry".equalsIgnoreCase(cat)) pr.setIntent(ProcessingRequest.Intent.GENERAL_INQUIRY);
            else if ("Order".equalsIgnoreCase(cat)) pr.setIntent(ProcessingRequest.Intent.QUOTATION_REQUEST);
            else if ("Others".equalsIgnoreCase(cat)) pr.setIntent(ProcessingRequest.Intent.UNCLASSIFIED);
        }
        
        if (body.containsKey("status")) {
            String stat = (String) body.get("status");
            if ("Open".equalsIgnoreCase(stat)) pr.setStatus(ProcessingRequest.ProcessingStatus.AWAITING_REVIEW);
            else if ("Completed".equalsIgnoreCase(stat)) pr.setStatus(ProcessingRequest.ProcessingStatus.COMPLETED);
            else if ("Abandoned".equalsIgnoreCase(stat) || "Not Relevant".equalsIgnoreCase(stat)) pr.setStatus(ProcessingRequest.ProcessingStatus.SKIPPED);
        }
        
        if (body.containsKey("customerName")) {
            String fullCustName = (String) body.get("customerName");
            if (fullCustName != null && fullCustName.contains("/")) {
                String code = fullCustName.split("/")[0].trim();
                customerRepository.findByEmailIgnoreCase(code).ifPresent(pr::setCustomer);
            }
        }
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<Map<String, Object>>> getLogs(@PathVariable Long id) {
        List<Map<String, Object>> logs = logRepository.findByProcessingRequestIdOrderByCreatedAtAsc(id)
                .stream().map(log -> Map.<String, Object>of(
                        "id", log.getId(),
                        "step", log.getStep(),
                        "status", log.getStatus().name(),
                        "details", log.getDetails() != null ? log.getDetails() : "",
                        "createdAt", log.getCreatedAt().toString()
                )).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncEmails() {
        int synced = emailProcessorService.syncAllRecentEmails();
        return ResponseEntity.ok(Map.of("synced", synced, "message", synced + " new emails synced to work items"));
    }

    private Map<String, Object> toMap(ProcessingRequest pr) {
        String quotationNo = quotationRepository.findByProcessingRequestId(pr.getId())
                .map(q -> q.getQuotationNumber()).orElse("");
        String invoiceNo = invoiceRepository.findByProcessingRequestId(pr.getId())
                .map(i -> i.getInvoiceNumber()).orElse("");

        return Map.ofEntries(
                Map.entry("id", pr.getId()),
                Map.entry("emailSubject", pr.getEmailSubject() != null ? pr.getEmailSubject() : ""),
                Map.entry("emailFrom", pr.getEmailFrom() != null ? pr.getEmailFrom() : ""),
                Map.entry("emailTo", pr.getEmailTo() != null ? pr.getEmailTo() : ""),
                Map.entry("intent", pr.getIntent() != null ? pr.getIntent().name() : "UNKNOWN"),
                Map.entry("status", pr.getStatus().name()),
                Map.entry("emailReceivedAt", pr.getEmailReceivedAt() != null ? pr.getEmailReceivedAt().toString() : ""),
                Map.entry("createdAt", pr.getCreatedAt() != null ? pr.getCreatedAt().toString() : ""),
                Map.entry("customerName", pr.getCustomer() != null ? pr.getCustomer().getName() : ""),
                Map.entry("customerCode", pr.getCustomer() != null ? pr.getCustomer().getEmail() : ""),
                Map.entry("quotationNo", quotationNo),
                Map.entry("invoiceNo", invoiceNo),
                Map.entry("attachmentCount", pr.getAttachmentCount() != null ? pr.getAttachmentCount() : 0)
        );
    }

    private Map<String, Object> toDetailMap(ProcessingRequest pr) {
        String quotationNo = quotationRepository.findByProcessingRequestId(pr.getId())
                .map(q -> q.getQuotationNumber()).orElse("");
        String invoiceNo = invoiceRepository.findByProcessingRequestId(pr.getId())
                .map(i -> i.getInvoiceNumber()).orElse("");

        return Map.ofEntries(
                Map.entry("id", pr.getId()),
                Map.entry("emailMessageId", pr.getEmailMessageId() != null ? pr.getEmailMessageId() : ""),
                Map.entry("emailSubject", pr.getEmailSubject() != null ? pr.getEmailSubject() : ""),
                Map.entry("emailFrom", pr.getEmailFrom() != null ? pr.getEmailFrom() : ""),
                Map.entry("emailTo", pr.getEmailTo() != null ? pr.getEmailTo() : ""),
                Map.entry("emailBodyPreview", pr.getEmailBodyPreview() != null ? pr.getEmailBodyPreview() : ""),
                Map.entry("combinedText", pr.getCombinedText() != null ? pr.getCombinedText() : ""),
                Map.entry("extractedPartsJson", pr.getExtractedPartsJson() != null ? pr.getExtractedPartsJson() : ""),
                Map.entry("intent", pr.getIntent() != null ? pr.getIntent().name() : "UNKNOWN"),
                Map.entry("status", pr.getStatus().name()),
                Map.entry("errorMessage", pr.getErrorMessage() != null ? pr.getErrorMessage() : ""),
                Map.entry("emailReceivedAt", pr.getEmailReceivedAt() != null ? pr.getEmailReceivedAt().toString() : ""),
                Map.entry("createdAt", pr.getCreatedAt() != null ? pr.getCreatedAt().toString() : ""),
                Map.entry("updatedAt", pr.getUpdatedAt() != null ? pr.getUpdatedAt().toString() : ""),
                Map.entry("customerName", pr.getCustomer() != null ? pr.getCustomer().getName() : ""),
                Map.entry("customerCode", pr.getCustomer() != null ? pr.getCustomer().getEmail() : ""),
                Map.entry("quotationNo", quotationNo),
                Map.entry("invoiceNo", invoiceNo),
                Map.entry("attachmentCount", pr.getAttachmentCount() != null ? pr.getAttachmentCount() : 0)
        );
    }
}
