package com.autonoma.erp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

/**
 * OCR Proxy Controller
 * ─────────────────────────────────────────────────────────────
 * Proxies requests to the standalone OCR service (port 9090).
 * This eliminates hardcoded localhost URLs in the frontend,
 * routing all OCR traffic through the main Spring Boot API
 * so auth interceptors and CORS policies apply uniformly.
 *
 * Configure via: ocr.service.url in application.properties
 */
@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "*")
public class OcrProxyController {

    @Value("${ocr.service.url:http://localhost:9090}")
    private String ocrServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // ─── Inbox Endpoints ────────────────────────────────────────────

    @GetMapping("/inbox")
    public ResponseEntity<String> getInbox(@RequestParam(defaultValue = "50") int limit) {
        String url = ocrServiceUrl + "/api/inbox?limit=" + limit;
        return forwardGet(url);
    }

    @PostMapping("/inbox/{id}/mark-read")
    public ResponseEntity<String> markRead(@PathVariable Long id) {
        String url = ocrServiceUrl + "/api/inbox/" + id + "/mark-read";
        return forwardPost(url, null);
    }

    // ─── Processing Request Endpoints ───────────────────────────────

    @GetMapping("/processing-requests")
    public ResponseEntity<String> getProcessingRequests() {
        String url = ocrServiceUrl + "/api/processing-requests";
        return forwardGet(url);
    }

    @PostMapping("/processing-requests")
    public ResponseEntity<String> createRequest(@RequestBody String body) {
        String url = ocrServiceUrl + "/api/processing-requests";
        return forwardPost(url, body);
    }

    @PutMapping("/processing-requests/{id}")
    public ResponseEntity<String> updateRequest(@PathVariable Long id, @RequestBody String body) {
        String url = ocrServiceUrl + "/api/processing-requests/" + id;
        return forwardPut(url, body);
    }

    @DeleteMapping("/processing-requests/{id}")
    public ResponseEntity<String> deleteRequest(@PathVariable Long id) {
        String url = ocrServiceUrl + "/api/processing-requests/" + id;
        restTemplate.delete(url);
        return ResponseEntity.ok().build();
    }

    // ─── Internal Forwarding Helpers ────────────────────────────────

    private ResponseEntity<String> forwardGet(String url) {
        return restTemplate.exchange(url, HttpMethod.GET, null, String.class);
    }

    private ResponseEntity<String> forwardPost(String url, String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        return restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }

    private ResponseEntity<String> forwardPut(String url, String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        return restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
    }
}
