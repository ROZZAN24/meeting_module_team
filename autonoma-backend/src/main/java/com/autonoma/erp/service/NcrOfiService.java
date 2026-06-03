package com.autonoma.erp.service;

import com.autonoma.erp.model.NcrOfiMaster;
import com.autonoma.erp.repository.NcrOfiMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NcrOfiService {

    @Autowired
    private NcrOfiMasterRepository ncrOfiMasterRepository;

    @Autowired
    private com.autonoma.erp.repository.NcrOfiActionRepository actionRepository;

    @Autowired
    private com.autonoma.erp.repository.NcrOfiAttachmentRepository attachmentRepository;

    @Autowired
    private com.autonoma.erp.repository.AuditObservationDetailRepository observationDetailRepository;

    @Autowired
    private com.autonoma.erp.repository.AuditObservationRepository auditObservationRepository;

    private final Path root = Paths.get("uploads");

    public NcrOfiService() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            System.err.println("Could not initialize folder for upload: " + e.getMessage());
        }
    }

    @Transactional
    public void processNcrClosureWithFiles(java.util.Map<String, Object> payload, List<MultipartFile> files) {
        // 1. Process Metadata first (same as processNcrClosure but we'll use the file names later)
        processNcrClosure(payload);
        
        // 2. Find the saved master to link files
        Number detailId = (Number) payload.get("observationDetailId");
        NcrOfiMaster master = ncrOfiMasterRepository.findFirstByObservationDetailIdOrderByIdDesc(detailId.intValue())
            .orElseThrow(() -> new RuntimeException("Master record not found after save"));

        // 3. Save files to disk and create attachment records
        if (files != null && !files.isEmpty()) {
            List<java.util.Map<String, String>> categories = (List<java.util.Map<String, String>>) payload.get("fileCategories");
            
            for (MultipartFile file : files) {
                try {
                    String originalName = file.getOriginalFilename();
                    String savedName = UUID.randomUUID().toString() + "_" + originalName;
                    Files.copy(file.getInputStream(), this.root.resolve(savedName), StandardCopyOption.REPLACE_EXISTING);
                    
                    // Link to category
                    String category = "GENERAL";
                    if (categories != null) {
                        category = categories.stream()
                            .filter(c -> c.get("fileName").equals(originalName))
                            .map(c -> c.get("docDetails"))
                            .findFirst()
                            .orElse("GENERAL");
                    }
                    
                    saveAttachment(master.getId(), savedName, category);
                } catch (IOException e) {
                    throw new RuntimeException("File save failed: " + e.getMessage());
                }
            }
        }
    }

    @Transactional
    public void processNcrClosure(java.util.Map<String, Object> payload) {
        Number observationDetailId = (Number) payload.get("observationDetailId");
        Number observationId = (Number) payload.get("observationId");
        String type = (String) payload.get("type");
        String rootCause = (String) payload.get("rootCause");
        String correctiveAction = (String) payload.get("correctiveAction");
        String preventiveAction = (String) payload.get("preventiveAction");
        String targetDateStr = (String) payload.get("targetDate");
        String attachmentPath = (String) payload.get("attachmentPath");
        String observationDateStr = (String) payload.get("observationDate");
        String ncrOfiNo = (String) payload.get("ncrOfiNo");
        String auditeeName = (String) payload.get("auditee");
        String ncrApproverName = (String) payload.get("ncrApprovedBy");

        // 1. Get or Create NcrOfiMaster record to prevent NonUniqueResultException
        NcrOfiMaster master = ncrOfiMasterRepository.findFirstByObservationDetailIdOrderByIdDesc(observationDetailId.intValue())
            .orElseGet(() -> {
                NcrOfiMaster newMaster = new NcrOfiMaster();
                newMaster.setObservationDetailId(observationDetailId != null ? observationDetailId.intValue() : null);
                return newMaster;
            });
            
        master.setObservationId(observationId != null ? observationId.intValue() : null);
        master.setType(type);
        master.setAuditeeName(auditeeName);
        master.setNcrApproverName(ncrApproverName);
        
        if (observationDateStr != null && observationDateStr.length() >= 10) {
            try {
                master.setObservationDate(LocalDate.parse(observationDateStr.substring(0, 10)));
            } catch (Exception e) {
                master.setObservationDate(LocalDate.now());
            }
        } else {
            master.setObservationDate(LocalDate.now());
        }

        if (targetDateStr != null && targetDateStr.length() >= 10) {
            try {
                master.setTargetDate(LocalDate.parse(targetDateStr.substring(0, 10)));
            } catch (Exception e) {
                master.setTargetDate(LocalDate.now().plusDays(30));
            }
        } else {
            master.setTargetDate(LocalDate.now().plusDays(30));
        }
        master.setRootCause(rootCause);
        master.setCorrectiveAction(correctiveAction);
        master.setPreventiveAction(preventiveAction);
        master.setStatus("WAITING_APPROVAL");
        master.setApprovalStatus("PENDING");
        if (master.getCreatedBy() == null) {
            master.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
        }
        
        // Use provided No or generate if not already set
        if (master.getNcrOfiNo() == null || master.getNcrOfiNo().isEmpty()) {
            if (ncrOfiNo != null && !ncrOfiNo.isEmpty() && !ncrOfiNo.equals("N/A")) {
                master.setNcrOfiNo(ncrOfiNo);
            } else {
                master.setNcrOfiNo(generateNcrOfiNo(type));
            }
        }
        
        NcrOfiMaster savedMaster = ncrOfiMasterRepository.save(master);

        // 2. Upsert Action records to avoid duplicate key or excessive entries
        saveAction(savedMaster.getId(), "ROOT_CAUSE", rootCause);
        saveAction(savedMaster.getId(), "CORRECTIVE", correctiveAction);
        saveAction(savedMaster.getId(), "PREVENTIVE", preventiveAction);

        // 3. Attachment records are handled by processNcrClosureWithFiles if files are provided
        // Legacy single-string attachment path can be kept for backward compatibility if needed
        if (attachmentPath != null && !attachmentPath.isEmpty()) {
            saveAttachment(savedMaster.getId(), attachmentPath, "GENERAL");
        }

        // 4. Update AuditObservationDetail status and sync CAPA fields
        observationDetailRepository.findById(observationDetailId.longValue()).ifPresent(detail -> {
            detail.setApprovalStatus("WAITING_APPROVAL");
            detail.setNcrStatus("WAITING_APPROVAL");
            detail.setNcrNo(savedMaster.getNcrOfiNo());
            detail.setRootCause(rootCause);
            detail.setCorrectiveAction(correctiveAction);
            detail.setPreventiveAction(preventiveAction);
            detail.setTargetDate(savedMaster.getTargetDate() != null ? java.sql.Date.valueOf(savedMaster.getTargetDate()) : null);
            observationDetailRepository.save(detail);
        });
    }

    public List<com.autonoma.erp.model.NcrOfiAttachment> getAttachmentsByDetailId(Integer detailId) {
        return ncrOfiMasterRepository.findFirstByObservationDetailIdOrderByIdDesc(detailId)
            .map(m -> attachmentRepository.findByNcrOfiId(m.getId()))
            .orElse(java.util.Collections.emptyList());
    }

    @Transactional
    public void approveNcr(Number observationDetailId) {
        observationDetailRepository.findById(observationDetailId.longValue()).ifPresent(detail -> {
            detail.setApprovalStatus("CLOSED");
            detail.setNcrStatus("CLOSED");
            observationDetailRepository.save(detail);
            
            ncrOfiMasterRepository.findFirstByObservationDetailIdOrderByIdDesc(observationDetailId.intValue()).ifPresent(master -> {
                master.setApprovalStatus("APPROVED");
                master.setStatus("CLOSED");
                master.setUpdatedAt(new java.util.Date());
                master.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                ncrOfiMasterRepository.save(master);
            });

            if (detail.getAuditObservation() != null) {
                recalculateParentScore(detail.getAuditObservation());
            }
        });
    }

    private void recalculateParentScore(com.autonoma.erp.model.AuditObservation observation) {
        if (observation == null || observation.getDetails() == null) return;
        
        int compliance = 0;
        int ofi = 0;
        int ncCount = 0;
        
        for (com.autonoma.erp.model.AuditObservationDetail detail : observation.getDetails()) {
            String obsStatus = detail.getObservationStatus();
            if ("COMPLIANCE".equalsIgnoreCase(obsStatus)) {
                compliance++;
            } else if ("OFI".equalsIgnoreCase(obsStatus)) {
                ofi++;
            } else if ("NC".equalsIgnoreCase(obsStatus) || "NCR".equalsIgnoreCase(obsStatus)) {
                ncCount++;
            }
        }
        
        java.util.Date obsDate = observation.getObservationDate();
        long diffDays = 0;
        if (obsDate != null) {
            java.util.Calendar calObs = java.util.Calendar.getInstance();
            calObs.setTime(obsDate);
            calObs.set(java.util.Calendar.HOUR_OF_DAY, 0);
            calObs.set(java.util.Calendar.MINUTE, 0);
            calObs.set(java.util.Calendar.SECOND, 0);
            calObs.set(java.util.Calendar.MILLISECOND, 0);
            
            java.util.Calendar calToday = java.util.Calendar.getInstance();
            calToday.set(java.util.Calendar.HOUR_OF_DAY, 0);
            calToday.set(java.util.Calendar.MINUTE, 0);
            calToday.set(java.util.Calendar.SECOND, 0);
            calToday.set(java.util.Calendar.MILLISECOND, 0);
            
            long diffMs = calToday.getTimeInMillis() - calObs.getTimeInMillis();
            diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays < 0) {
                diffDays = 0;
            }
        }
        
        int score = 0;
        for (com.autonoma.erp.model.AuditObservationDetail detail : observation.getDetails()) {
            String obsStatus = detail.getObservationStatus();
            String appStatus = detail.getApprovalStatus();
            
            if ("COMPLIANCE".equalsIgnoreCase(obsStatus)) {
                score += 1;
            } else if ("OFI".equalsIgnoreCase(obsStatus)) {
                score += 0;
            } else if ("NC".equalsIgnoreCase(obsStatus) || "NCR".equalsIgnoreCase(obsStatus)) {
                if ("CLOSED".equalsIgnoreCase(appStatus)) {
                    score += 0;
                } else {
                    if (diffDays <= 3) {
                        score += -1;
                    } else if (diffDays <= 5) {
                        score += -3;
                    } else if (diffDays <= 8) {
                        score += -5;
                    } else {
                        score += -8;
                    }
                }
            }
        }
        
        observation.setComplianceCount(compliance);
        observation.setOfiCount(ofi);
        observation.setNcrCount(ncCount);
        observation.setAuditScore(score);
        
        auditObservationRepository.save(observation);
    }

    @Transactional
    public void rejectNcr(Number observationDetailId, String remarks) {
        observationDetailRepository.findById(observationDetailId.longValue()).ifPresent(detail -> {
            detail.setApprovalStatus("UNRESOLVED");
            detail.setNcrStatus("UNRESOLVED");
            detail.setComments(remarks);
            observationDetailRepository.save(detail);
            
            ncrOfiMasterRepository.findFirstByObservationDetailIdOrderByIdDesc(observationDetailId.intValue()).ifPresent(master -> {
                master.setApprovalStatus("UNRESOLVED");
                master.setStatus("OPEN");
                master.setUpdatedAt(new java.util.Date());
                master.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                ncrOfiMasterRepository.save(master);
            });
        });
    }

    @Transactional
    public void reworkNcr(Number observationDetailId, String remarks) {
        observationDetailRepository.findById(observationDetailId.longValue()).ifPresent(detail -> {
            detail.setApprovalStatus("REWORK");
            detail.setNcrStatus("REWORK");
            detail.setComments(remarks);
            observationDetailRepository.save(detail);
            
            ncrOfiMasterRepository.findFirstByObservationDetailIdOrderByIdDesc(observationDetailId.intValue()).ifPresent(master -> {
                master.setApprovalStatus("REWORK");
                master.setStatus("ACTION PENDING");
                master.setUpdatedAt(new java.util.Date());
                master.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                ncrOfiMasterRepository.save(master);
            });
        });
    }

    private void saveAttachment(Integer masterId, String filePath, String category) {
        if (filePath == null || filePath.isEmpty()) return;
        com.autonoma.erp.model.NcrOfiAttachment attachment = new com.autonoma.erp.model.NcrOfiAttachment();
        attachment.setNcrOfiId(masterId);
        attachment.setFilePath(filePath);
        attachment.setFileName(new java.io.File(filePath).getName());
        attachment.setFileType(category);
        attachment.setUploadedBy("Admin");
        attachmentRepository.save(attachment);
    }

    private void saveAction(Integer masterId, String type, String desc) {
        if (desc == null || desc.isEmpty()) return;
        List<com.autonoma.erp.model.NcrOfiAction> existingActions = actionRepository.findByNcrOfiId(masterId);
        com.autonoma.erp.model.NcrOfiAction action = existingActions.stream()
            .filter(a -> type.equals(a.getActionType()))
            .findFirst()
            .orElseGet(() -> {
                com.autonoma.erp.model.NcrOfiAction newAction = new com.autonoma.erp.model.NcrOfiAction();
                newAction.setNcrOfiId(masterId);
                newAction.setActionType(type);
                return newAction;
            });
        action.setActionDescription(desc);
        action.setStatus("COMPLETED");
        action.setCreatedAt(new java.util.Date());
        actionRepository.save(action);
    }

    public List<NcrOfiMaster> getAllNcrOfis() {
        return ncrOfiMasterRepository.findAll();
    }

    public Optional<NcrOfiMaster> getNcrOfiById(Integer id) {
        return ncrOfiMasterRepository.findById(id);
    }

    public Optional<NcrOfiMaster> getNcrOfiByObservationDetailId(Integer detailId) {
        return ncrOfiMasterRepository.findFirstByObservationDetailIdOrderByIdDesc(detailId);
    }

    @Transactional
    public NcrOfiMaster saveNcrOfi(NcrOfiMaster ncrOfi) {
        if (ncrOfi.getNcrOfiNo() == null || ncrOfi.getNcrOfiNo().isEmpty()) {
            ncrOfi.setNcrOfiNo(generateNcrOfiNo(ncrOfi.getType()));
        }
        ncrOfi.setUpdatedAt(new java.util.Date());
        return ncrOfiMasterRepository.save(ncrOfi);
    }

    public String generateNextNo(String type) {
        return generateNcrOfiNo(type);
    }

    private String generateNcrOfiNo(String type) {
        String year = String.valueOf(LocalDate.now().getYear());
        String prefix = type + "/" + year + "/";
        String maxNo = ncrOfiMasterRepository.findMaxNoByTypeAndPrefix(type, prefix + "%");
        
        int runningNo = 1;
        if (maxNo != null && maxNo.contains("/")) {
            String[] parts = maxNo.split("/");
            if (parts.length == 3) {
                try {
                    runningNo = Integer.parseInt(parts[2]) + 1;
                } catch (NumberFormatException e) {
                    runningNo = 1;
                }
            }
        }
        return prefix + String.format("%06d", runningNo);
    }

    @Transactional
    public void deleteNcrOfi(Integer id) {
        ncrOfiMasterRepository.deleteById(id);
    }

    // SOP: Close NCR - Search Logic (SOP 6.1)
    // Fetches observations that are NCR/OFI and need closure
    public List<Object[]> getPendingFindings() {
        // In a real implementation, this would be a complex JOIN query
        // between AuditObservationDetail and NcrOfiMaster
        // For now, we provide the service hook for the controller
        return null; 
    }
}

