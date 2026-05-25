package com.autonoma.erp.controller;


import com.autonoma.erp.security.RequirePagePermission;
import com.autonoma.erp.model.NcrOfiMaster;
import com.autonoma.erp.service.NcrOfiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qms/ncr-ofi")
@CrossOrigin(origins = "*")
public class NcrOfiController {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(NcrOfiController.class);

    @Autowired
    private NcrOfiService ncrOfiService;

    @GetMapping
    public List<NcrOfiMaster> getAll() {
        return ncrOfiService.getAllNcrOfis();
    }

    @GetMapping("/attachments/{detailId}")
    public List<com.autonoma.erp.model.NcrOfiAttachment> getAttachments(@PathVariable Integer detailId) {
        return ncrOfiService.getAttachmentsByDetailId(detailId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NcrOfiMaster> getById(@PathVariable Integer id) {
        return ncrOfiService.getNcrOfiById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-observation-detail/{detailId}")
    public ResponseEntity<NcrOfiMaster> getByObservationDetail(@PathVariable Integer detailId) {
        return ncrOfiService.getNcrOfiByObservationDetailId(detailId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping


    @RequirePagePermission(pageCode = "QM1240", action = "write")
    public ResponseEntity<?> create(HttpServletRequest request) {
        try {
            MultipartHttpServletRequest multipartRequest;
            if (request instanceof MultipartHttpServletRequest) {
                multipartRequest = (MultipartHttpServletRequest) request;
            } else {
                StandardServletMultipartResolver resolver = new StandardServletMultipartResolver();
                multipartRequest = resolver.resolveMultipart(request);
            }

            String dataJson = multipartRequest.getParameter("data");
            List<MultipartFile> files = multipartRequest.getFiles("files");
            
            logger.info("Received NCR Closure Submission. Payload: {}, File Count: {}", 
                dataJson, files != null ? files.size() : 0);
            
            if (dataJson == null) {
                return ResponseEntity.badRequest().body("Missing 'data' parameter in multipart request");
            }

            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            Map<String, Object> payload = mapper.readValue(dataJson, Map.class);
            ncrOfiService.processNcrClosureWithFiles(payload, files);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Submission failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Submission failed: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")


    @RequirePagePermission(pageCode = "QM1250", action = "write")
    public NcrOfiMaster update(@PathVariable Integer id, @RequestBody NcrOfiMaster ncrOfi) {
        ncrOfi.setId(id);
        return ncrOfiService.saveNcrOfi(ncrOfi);
    }

    @DeleteMapping("/{id}")


    @RequirePagePermission(pageCode = "QM1240", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        ncrOfiService.deleteNcrOfi(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/next-no/{type}")
    public String getNextNo(@PathVariable String type) {
        return ncrOfiService.generateNextNo(type);
    }
}
