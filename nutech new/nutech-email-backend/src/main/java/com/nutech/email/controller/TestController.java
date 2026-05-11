package com.nutech.email.controller;

import com.nutech.email.model.ProcessingRequest;
import com.nutech.email.repository.ProcessingRequestRepository;
import com.nutech.email.service.EmailProcessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final ProcessingRequestRepository processingRequestRepository;

    @PostMapping("/simulate-ingestion")
    public ResponseEntity<ProcessingRequest> simulateIngestion() {
        // Create a fake processing request to test the UI flow
        ProcessingRequest request = ProcessingRequest.builder()
                .emailMessageId("TEST-" + UUID.randomUUID().toString())
                .emailSubject("Inquiry for Ball Bearings")
                .emailFrom("tester@example.com")
                .emailBodyPreview("Hi Nutech, I need 20 units of BRG-6205. Please send a quote.")
                .emailReceivedAt(LocalDateTime.now())
                .status(ProcessingRequest.ProcessingStatus.AWAITING_REVIEW)
                .intent(ProcessingRequest.Intent.QUOTATION_REQUEST)
                .combinedText("Hi Nutech, I need 20 units of BRG-6205. Please send a quote.")
                .extractedPartsJson("[{\"partCode\":\"BRG-6205\",\"quantity\":20}]")
                .build();
        
        return ResponseEntity.ok(processingRequestRepository.save(request));
    }
}
