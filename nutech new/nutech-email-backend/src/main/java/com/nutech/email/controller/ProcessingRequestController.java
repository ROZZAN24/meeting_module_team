package com.nutech.email.controller;

import com.nutech.email.model.EmailProcessingLog;
import com.nutech.email.model.ProcessingRequest;
import com.nutech.email.repository.EmailProcessingLogRepository;
import com.nutech.email.repository.ProcessingRequestRepository;
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

    private Map<String, Object> toMap(ProcessingRequest pr) {
        String quotationNo = quotationRepository.findByProcessingRequestId(pr.getId())
                .map(q -> q.getQuotationNumber()).orElse("");
        String invoiceNo = invoiceRepository.findByProcessingRequestId(pr.getId())
                .map(i -> i.getInvoiceNumber()).orElse("");

        return Map.ofEntries(
                Map.entry("id", pr.getId()),
                Map.entry("emailSubject", pr.getEmailSubject() != null ? pr.getEmailSubject() : ""),
                Map.entry("emailFrom", pr.getEmailFrom() != null ? pr.getEmailFrom() : ""),
                Map.entry("intent", pr.getIntent() != null ? pr.getIntent().name() : "UNKNOWN"),
                Map.entry("status", pr.getStatus().name()),
                Map.entry("emailReceivedAt", pr.getEmailReceivedAt() != null ? pr.getEmailReceivedAt().toString() : ""),
                Map.entry("createdAt", pr.getCreatedAt() != null ? pr.getCreatedAt().toString() : ""),
                Map.entry("customerName", pr.getCustomer() != null ? pr.getCustomer().getName() : ""),
                Map.entry("customerCode", pr.getCustomer() != null ? pr.getCustomer().getCustomerCode() : ""),
                Map.entry("quotationNo", quotationNo),
                Map.entry("invoiceNo", invoiceNo)
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
                Map.entry("customerCode", pr.getCustomer() != null ? pr.getCustomer().getCustomerCode() : ""),
                Map.entry("quotationNo", quotationNo),
                Map.entry("invoiceNo", invoiceNo)
        );
    }
}
