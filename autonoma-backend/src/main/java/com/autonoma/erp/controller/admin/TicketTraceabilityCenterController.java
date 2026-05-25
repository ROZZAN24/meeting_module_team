package com.autonoma.erp.controller.admin;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.*;
import com.autonoma.erp.repository.admin.UserRepository;
import com.autonoma.erp.model.admin.UserCredential;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import com.autonoma.erp.service.FileService;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
@Tag(name = "Admin - Ticket Traceability Center", description = "Endpoints for managing support tickets and workflows")
public class TicketTraceabilityCenterController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory
            .getLogger(TicketTraceabilityCenterController.class);

    private static final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Autowired
    private TicketTraceabilityCenterRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileService fileService;

    @Autowired
    private EmployeeMasterRepository employeeMasterRepository;

    @Autowired
    private SupportTicketCommentRepository commentRepository;

    @Autowired
    private SupportTicketStatusHistoryRepository statusHistoryRepository;

    @Autowired
    private SupportTicketAttachmentRepository attachmentRepository;

    @Autowired
    private SupportTicketReopenHistoryRepository reopenHistoryRepository;

    private boolean isInternalUser() {
        String userId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        if (userId == null)
            return false;
        Optional<UserCredential> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            UserCredential user = userOpt.get();
            return (user.getIsBosAdmin() != null && user.getIsBosAdmin() == 1) || user.getEmpId() != null;
        }
        return false;
    }

    private String getCurrentUser() {
        String userId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        return userId != null ? userId : "System";
    }

    @GetMapping
    @Operation(summary = "Get All Tickets", description = "Fetches tickets list based on current user roles")
    public List<TicketTraceabilityCenter> getAllTickets() {
        log.info("Fetching tickets");
        List<TicketTraceabilityCenter> allTickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        boolean isInternal = isInternalUser();
        String currentUserId = getCurrentUser();

        List<TicketTraceabilityCenter> filtered = new ArrayList<>();
        for (TicketTraceabilityCenter t : allTickets) {
            if (isInternal
                    || (t.getCreatedBy() != null && t.getCreatedBy().equalsIgnoreCase(currentUserId))
                    || (t.getEmail() != null && t.getEmail().equalsIgnoreCase(currentUserId))) {
                filtered.add(t);
            }
        }
        return filtered;
    }

    @GetMapping("/{rowId}")
    @Operation(summary = "Get Ticket By Row ID")
    public ResponseEntity<TicketTraceabilityCenter> getTicketById(@PathVariable Integer rowId) {
        log.info("Fetching ticket with ID: {}", rowId);
        Optional<TicketTraceabilityCenter> ticketOpt = ticketRepository.findById(rowId);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TicketTraceabilityCenter ticket = ticketOpt.get();
        boolean isInternal = isInternalUser();
        String currentUserId = getCurrentUser();

        // Access check
        if (!isInternal
                && (ticket.getCreatedBy() != null && !ticket.getCreatedBy().equalsIgnoreCase(currentUserId))
                && (ticket.getEmail() != null && !ticket.getEmail().equalsIgnoreCase(currentUserId))) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(ticket);
    }

    @PostMapping
    @Operation(summary = "Create Ticket")
    public ResponseEntity<?> createTicket(@RequestBody TicketTraceabilityCenter ticket) {
        log.info("Creating support ticket: {}", ticket);
        try {
            // Auto generate ticket ID based on type
            String prefix = "INT-";
            if (ticket.getTicketType() != null && ticket.getTicketType().equalsIgnoreCase("External")) {
                prefix = "EXT-";
            }
            String dateStr = new java.text.SimpleDateFormat("yyyyMMdd").format(new Date());
            String pattern = prefix + dateStr + "-%";

            List<TicketTraceabilityCenter> latestList = ticketRepository.findLatestByTicketIdPattern(pattern);
            int nextNum = 1;
            if (!latestList.isEmpty()) {
                String latestId = latestList.get(0).getTicketId();
                try {
                    String numStr = latestId.substring(latestId.lastIndexOf("-") + 1);
                    nextNum = Integer.parseInt(numStr) + 1;
                } catch (Exception e) {
                    log.warn("Failed to parse sequence from ticket ID: {}", latestId);
                }
            }
            String ticketId = String.format("%s%s-%04d", prefix, dateStr, nextNum);
            ticket.setTicketId(ticketId);

            if (ticket.getTicketStatus() == null || ticket.getTicketStatus().trim().isEmpty()) {
                ticket.setTicketStatus("Open");
            }
            ticket.setReopenedCount(0);

            TicketTraceabilityCenter savedTicket = ticketRepository.save(ticket);

            // Log status history transition
            logStatusHistory(savedTicket.getRowId(), "Ticket Created", ticket.getDescription(), null, savedTicket.getTicketStatus(), null, null);

            // Move files and log attachments using helper method
            List<String> finalAttachments = moveTempFiles(ticket.getTempAttachments(), ticketId, savedTicket.getRowId(), "Attachment", "Attachments");
            List<String> finalVoices = moveTempFiles(ticket.getTempVoiceRecordings(), ticketId, savedTicket.getRowId(), "Voice Recording", "Voice Recordings");

            // Combine final paths if we want to store them in attachment_path
            List<String> allFinalPaths = new ArrayList<>();
            allFinalPaths.addAll(finalAttachments);
            allFinalPaths.addAll(finalVoices);

            if (!allFinalPaths.isEmpty()) {
                savedTicket.setAttachmentPath(String.join(",", allFinalPaths));
                savedTicket = ticketRepository.save(savedTicket);
            }

            return ResponseEntity.ok(savedTicket);
        } catch (Exception e) {
            log.error("Error creating ticket", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{rowId}")
    @Operation(summary = "Update Ticket")
    public ResponseEntity<?> updateTicket(@PathVariable Integer rowId,
            @RequestBody TicketTraceabilityCenter ticketDetails) {
        log.info("Updating ticket with row ID: {}", rowId);
        try {
            Optional<TicketTraceabilityCenter> ticketOpt = ticketRepository.findById(rowId);
            if (ticketOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            TicketTraceabilityCenter existingTicket = ticketOpt.get();
            boolean isInternal = isInternalUser();
            String currentUserId = getCurrentUser();

            // Access check
            if (!isInternal
                    && (existingTicket.getCreatedBy() != null
                            && !existingTicket.getCreatedBy().equalsIgnoreCase(currentUserId))
                    && (existingTicket.getEmail() != null
                            && !existingTicket.getEmail().equalsIgnoreCase(currentUserId))) {
                return ResponseEntity.status(403).build();
            }

            String oldStatus = existingTicket.getTicketStatus();

            // Update allowed fields
            if (ticketDetails.getTitle() != null)
                existingTicket.setTitle(ticketDetails.getTitle());
            if (ticketDetails.getModuleName() != null)
                existingTicket.setModuleName(ticketDetails.getModuleName());
            if (ticketDetails.getPageName() != null)
                existingTicket.setPageName(ticketDetails.getPageName());
            if (ticketDetails.getEmployeeCode() != null)
                existingTicket.setEmployeeCode(ticketDetails.getEmployeeCode());
            if (ticketDetails.getEmployeeName() != null)
                existingTicket.setEmployeeName(ticketDetails.getEmployeeName());
            if (ticketDetails.getEmail() != null)
                existingTicket.setEmail(ticketDetails.getEmail());
            if (ticketDetails.getMobileNo() != null)
                existingTicket.setMobileNo(ticketDetails.getMobileNo());
            if (ticketDetails.getDepartment() != null)
                existingTicket.setDepartment(ticketDetails.getDepartment());
            if (ticketDetails.getDescription() != null)
                existingTicket.setDescription(ticketDetails.getDescription());
            if (ticketDetails.getPriorityLevel() != null)
                existingTicket.setPriorityLevel(ticketDetails.getPriorityLevel());
            if (ticketDetails.getSeverityLevel() != null)
                existingTicket.setSeverityLevel(ticketDetails.getSeverityLevel());

            // Workflow details
            if (ticketDetails.getAssignedTo() != null) {
                String oldAssignee = existingTicket.getAssignedTo();
                String newAssignee = ticketDetails.getAssignedTo();
                if (oldAssignee == null || !oldAssignee.equalsIgnoreCase(newAssignee)) {
                    existingTicket.setAssignedTo(newAssignee);
                    logStatusHistory(existingTicket.getRowId(), "Ticket Reassigned", "Reassigned to " + newAssignee, oldStatus, oldStatus, newAssignee, null);
                }
            }
            if (ticketDetails.getAssignedBy() != null)
                existingTicket.setAssignedBy(ticketDetails.getAssignedBy());
            if (ticketDetails.getDeveloperName() != null)
                existingTicket.setDeveloperName(ticketDetails.getDeveloperName());
            if (ticketDetails.getDeveloperEmail() != null)
                existingTicket.setDeveloperEmail(ticketDetails.getDeveloperEmail());
            if (ticketDetails.getDeveloperMobileNo() != null)
                existingTicket.setDeveloperMobileNo(ticketDetails.getDeveloperMobileNo());

            if (ticketDetails.getDueDate() != null)
                existingTicket.setDueDate(ticketDetails.getDueDate());
            if (ticketDetails.getTargetDate() != null) {
                Date oldTargetDate = existingTicket.getTargetDate();
                Date newTargetDate = ticketDetails.getTargetDate();
                boolean targetDateChanged = false;
                if (oldTargetDate == null && newTargetDate != null) {
                    targetDateChanged = true;
                } else if (oldTargetDate != null && newTargetDate != null && !oldTargetDate.equals(newTargetDate)) {
                    targetDateChanged = true;
                }
                if (targetDateChanged) {
                    existingTicket.setTargetDate(newTargetDate);
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                    String changeStr = (oldTargetDate == null ? "None" : sdf.format(oldTargetDate)) + " -> " + sdf.format(newTargetDate);
                    logStatusHistory(existingTicket.getRowId(), "Target Date Updated", "Target date updated to " + sdf.format(newTargetDate), oldStatus, oldStatus, null, changeStr);
                }
            }
            if (ticketDetails.getTakenTime() != null)
                existingTicket.setTakenTime(ticketDetails.getTakenTime());
            if (ticketDetails.getReworkTime() != null)
                existingTicket.setReworkTime(ticketDetails.getReworkTime());
            if (ticketDetails.getDueDateReason() != null)
                existingTicket.setDueDateReason(ticketDetails.getDueDateReason());

            if (ticketDetails.getResolutionSummary() != null)
                existingTicket.setResolutionSummary(ticketDetails.getResolutionSummary());
            if (ticketDetails.getRootCause() != null)
                existingTicket.setRootCause(ticketDetails.getRootCause());
            if (ticketDetails.getSourceType() != null)
                existingTicket.setSourceType(ticketDetails.getSourceType());

            // Move any new temp attachments/voices if they are sent in tempAttachments or tempVoiceRecordings lists:
            if (ticketDetails.getTempAttachments() != null && !ticketDetails.getTempAttachments().isEmpty()) {
                moveTempFiles(ticketDetails.getTempAttachments(), existingTicket.getTicketId(), existingTicket.getRowId(), "Attachment", "Attachments");
            }
            if (ticketDetails.getTempVoiceRecordings() != null && !ticketDetails.getTempVoiceRecordings().isEmpty()) {
                moveTempFiles(ticketDetails.getTempVoiceRecordings(), existingTicket.getTicketId(), existingTicket.getRowId(), "Voice Recording", "Voice Recordings");
            }

            // Sync the comma-separated attachment_path column in DB
            List<SupportTicketAttachment> allDbAttachments = attachmentRepository.findByTicketRowIdOrderByUploadedAtAsc(existingTicket.getRowId());
            List<String> dbPaths = new ArrayList<>();
            for (SupportTicketAttachment att : allDbAttachments) {
                dbPaths.add(att.getFilePath());
            }
            existingTicket.setAttachmentPath(String.join(",", dbPaths));

            // Handle status updates and workflow transitions
            if (ticketDetails.getTicketStatus() != null) {
                String newStatus = ticketDetails.getTicketStatus();
                if (!newStatus.equalsIgnoreCase(oldStatus)) {
                    existingTicket.setTicketStatus(newStatus);

                    // Automate resolved_at and closed_at timestamps
                    if (newStatus.equalsIgnoreCase("Resolved")) {
                        existingTicket.setResolvedAt(new Date());
                    } else if (newStatus.equalsIgnoreCase("Closed")) {
                        existingTicket.setClosedAt(new Date());
                        if (existingTicket.getResolvedAt() == null) {
                            existingTicket.setResolvedAt(new Date());
                        }
                    }

                    // Check for Reopen workflow transition
                    if (newStatus.equalsIgnoreCase("Reopened") && !oldStatus.equalsIgnoreCase("Reopened")) {
                        existingTicket.setReopenedCount(existingTicket.getReopenedCount() + 1);

                        SupportTicketReopenHistory reopenHistory = SupportTicketReopenHistory.builder()
                                .ticketRowId(existingTicket.getRowId())
                                .reopenedBy(currentUserId)
                                .reason(ticketDetails.getResolutionSummary() != null
                                        ? ticketDetails.getResolutionSummary()
                                        : "Reopened by user")
                                .expectedDuration(ticketDetails.getTakenTime())
                                .reopenTargetDate(ticketDetails.getTargetDate())
                                .build();
                        reopenHistoryRepository.save(reopenHistory);
                    }

                    // Log status history transition
                    String transitionComment = ticketDetails.getResolutionSummary();
                    if (transitionComment == null || transitionComment.trim().isEmpty()) {
                        transitionComment = "Status updated to " + newStatus;
                    }
                    if ("Resolved".equalsIgnoreCase(newStatus) && ticketDetails.getTakenTime() != null
                            && !ticketDetails.getTakenTime().trim().isEmpty()) {
                        transitionComment = transitionComment + " | Taken Time: " + ticketDetails.getTakenTime().trim();
                    }
                    String activityName = "Status Changed";
                    if ("Resolved".equalsIgnoreCase(newStatus)) {
                        activityName = "Ticket Resolved";
                    } else if ("Closed".equalsIgnoreCase(newStatus)) {
                        activityName = "Ticket Closed";
                    }
                    logStatusHistory(existingTicket.getRowId(), activityName, transitionComment, oldStatus, newStatus, null, null);
                }
            }

            TicketTraceabilityCenter updatedTicket = ticketRepository.save(existingTicket);
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception e) {
            log.error("Error updating ticket", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{rowId}")
    @Operation(summary = "Delete Ticket")
    public ResponseEntity<?> deleteTicket(@PathVariable Integer rowId) {
        log.info("Deleting ticket ID: {}", rowId);
        try {
            Optional<TicketTraceabilityCenter> ticketOpt = ticketRepository.findById(rowId);
            if (ticketOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            if (!isInternalUser()) {
                return ResponseEntity.status(403).build();
            }
            ticketRepository.deleteById(rowId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Ticket deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting ticket", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Ticket Comments Endpoints ---

    @GetMapping("/{rowId}/comments")
    @Operation(summary = "Get Ticket Comments")
    public List<SupportTicketComment> getComments(@PathVariable Integer rowId) {
        List<SupportTicketComment> comments = commentRepository.findByTicketRowIdOrderByCreatedAtAsc(rowId);
        boolean isInternal = isInternalUser();

        if (isInternal) {
            return comments;
        }

        // External users: Filter out "Internal Note" type comments
        List<SupportTicketComment> externalComments = new ArrayList<>();
        for (SupportTicketComment c : comments) {
            if (!"Internal Note".equalsIgnoreCase(c.getCommentType())) {
                externalComments.add(c);
            }
        }
        return externalComments;
    }

    @PostMapping("/{rowId}/comments")
    @Operation(summary = "Add Comment to Ticket")
    public ResponseEntity<?> addComment(@PathVariable Integer rowId, @RequestBody SupportTicketComment comment) {
        try {
            comment.setTicketRowId(rowId);
            comment.setCommentedBy(getCurrentUser());
            if (comment.getCommentType() == null) {
                comment.setCommentType("Public Reply");
            }

            // Double check access control: external user cannot submit Internal Note
            if (!isInternalUser() && "Internal Note".equalsIgnoreCase(comment.getCommentType())) {
                return ResponseEntity.status(403).body(Map.of("error", "External users cannot post Internal Notes"));
            }

            SupportTicketComment savedComment = commentRepository.save(comment);

            // Log comment into status history
            logStatusHistory(rowId, "Comment Added", comment.getComments(), null, null, null, null);

            // Log comment into status history if it represents a resolution update
            if ("Resolution Update".equalsIgnoreCase(comment.getCommentType())) {
                Optional<TicketTraceabilityCenter> tOpt = ticketRepository.findById(rowId);
                if (tOpt.isPresent()) {
                    TicketTraceabilityCenter ticket = tOpt.get();
                    ticket.setResolutionSummary(comment.getComments());
                    ticketRepository.save(ticket);
                }
            }

            return ResponseEntity.ok(savedComment);
        } catch (Exception e) {
            log.error("Error adding comment", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- History, Attachments, Reopens Endpoints ---

    @GetMapping("/{rowId}/history")
    @Operation(summary = "Get Ticket Status History")
    public List<SupportTicketStatusHistory> getStatusHistory(@PathVariable Integer rowId) {
        return statusHistoryRepository.findByTicketRowIdOrderByUpdatedAtAsc(rowId);
    }

    @GetMapping("/{rowId}/reopens")
    @Operation(summary = "Get Ticket Reopen History")
    public List<SupportTicketReopenHistory> getReopenHistory(@PathVariable Integer rowId) {
        return reopenHistoryRepository.findByTicketRowIdOrderByReopenedAtAsc(rowId);
    }

    @GetMapping("/{rowId}/attachments")
    @Operation(summary = "Get Ticket Attachments")
    public List<SupportTicketAttachment> getAttachments(@PathVariable Integer rowId) {
        return attachmentRepository.findByTicketRowIdOrderByUploadedAtAsc(rowId);
    }

    @PostMapping("/{rowId}/attachments")
    @Operation(summary = "Upload Attachment to Ticket")
    public ResponseEntity<?> addAttachment(@PathVariable Integer rowId,
            @RequestBody SupportTicketAttachment attachment) {
        try {
            Optional<TicketTraceabilityCenter> ticketOpt = ticketRepository.findById(rowId);
            if (ticketOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            TicketTraceabilityCenter ticket = ticketOpt.get();

            String tempPath = attachment.getFilePath();
            String fileType = attachment.getFileType();
            if (fileType == null || fileType.trim().isEmpty()) {
                fileType = "Attachment";
            }
            String subDirName = "Voice Recording".equalsIgnoreCase(fileType) ? "Voice Recordings" : "Attachments";

            String destRelativeFolder = "Ticketing/" + ticket.getTicketId() + "/" + subDirName;
            Path rootPath = fileService.getRootPath();
            Path source = rootPath.resolve(tempPath.trim()).normalize();

            if (Files.exists(source) && !Files.isDirectory(source)) {
                Path destFolder = rootPath.resolve(destRelativeFolder).normalize();
                if (!Files.exists(destFolder)) {
                    Files.createDirectories(destFolder);
                }

                String fileName = source.getFileName().toString();
                Path destFile = destFolder.resolve(fileName);
                Files.move(source, destFile, StandardCopyOption.REPLACE_EXISTING);

                String relativeDestPath = destRelativeFolder + "/" + fileName;
                attachment.setFilePath(relativeDestPath);

                String displayName = fileName;
                int underIdx = fileName.indexOf('_');
                if (underIdx != -1) {
                    displayName = fileName.substring(underIdx + 1);
                }
                attachment.setFileName(displayName);
            }

            attachment.setTicketRowId(rowId);
            attachment.setTicketId(ticket.getTicketId());
            attachment.setFileType(fileType);
            attachment.setUploadedBy(getCurrentUser());
            SupportTicketAttachment saved = attachmentRepository.save(attachment);

            // Sync ticket attachment_path field
            List<SupportTicketAttachment> allDbAttachments = attachmentRepository.findByTicketRowIdOrderByUploadedAtAsc(rowId);
            List<String> dbPaths = new ArrayList<>();
            for (SupportTicketAttachment att : allDbAttachments) {
                dbPaths.add(att.getFilePath());
            }
            ticket.setAttachmentPath(String.join(",", dbPaths));
            ticketRepository.save(ticket);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error uploading attachment", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private static final Set<String> GOVERNMENT_HOLIDAYS = new HashSet<>(Arrays.asList(
        // 2025
        "2025-01-01", "2025-01-26", "2025-03-14", "2025-04-18", "2025-05-01", 
        "2025-08-15", "2025-10-02", "2025-10-20", "2025-11-05", "2025-12-25",
        // 2026
        "2026-01-01", "2026-01-26", "2026-03-02", "2026-04-03", "2026-05-01", 
        "2026-08-15", "2026-10-02", "2026-10-20", "2026-11-08", "2026-12-25",
        // 2027
        "2027-01-01", "2027-01-26", "2027-03-22", "2027-04-16", "2027-05-01", 
        "2027-08-15", "2027-10-02", "2027-10-09", "2027-11-08", "2027-12-25"
    ));

    private boolean isNonWorkingDay(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
        if (dayOfWeek == Calendar.SUNDAY) {
            return true;
        }
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
        String dateStr = sdf.format(date);
        return GOVERNMENT_HOLIDAYS.contains(dateStr);
    }

    @GetMapping("/workload/{developerName}")
    @Operation(summary = "Get developer workload (allocated minutes per date)")
    public ResponseEntity<Map<String, WorkloadDayDetail>> getDeveloperWorkload(@PathVariable String developerName) {
        try {
            List<TicketTraceabilityCenter> tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
            tickets.sort(Comparator.comparing(TicketTraceabilityCenter::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));
            List<TicketTraceabilityCenter> activeTickets = new ArrayList<>();
            for (TicketTraceabilityCenter t : tickets) {
                if (t.getDeveloperName() == null || !t.getDeveloperName().equalsIgnoreCase(developerName)) {
                    continue;
                }
                String status = t.getTicketStatus();
                if ("Closed".equalsIgnoreCase(status) || "Resolved".equalsIgnoreCase(status)) {
                    continue;
                }
                String hours = t.getAssignedHours();
                if (hours == null || hours.trim().isEmpty()) {
                    continue;
                }
                activeTickets.add(t);
            }

            Map<String, WorkloadDayDetail> workload = new LinkedHashMap<>();
            final int DAILY_CAPACITY = 12 * 60; // 12 Hours max per day

            for (TicketTraceabilityCenter t : activeTickets) {
                String[] parts = t.getAssignedHours().split(":");
                int remainingMins = 0;
                try {
                    remainingMins = Integer.parseInt(parts[0]) * 60 + (parts.length > 1 ? Integer.parseInt(parts[1]) : 0);
                } catch (NumberFormatException ignored) {
                }

                if (t.getTakenTime() != null && !t.getTakenTime().trim().isEmpty()) {
                    String[] ttParts = t.getTakenTime().split(":");
                    try {
                        remainingMins -= Integer.parseInt(ttParts[0]) * 60 + (ttParts.length > 1 ? Integer.parseInt(ttParts[1]) : 0);
                    } catch (NumberFormatException ignored) {}
                }
                if (t.getReworkTime() != null && !t.getReworkTime().trim().isEmpty()) {
                    String[] rwParts = t.getReworkTime().split(":");
                    try {
                        remainingMins -= Integer.parseInt(rwParts[0]) * 60 + (rwParts.length > 1 ? Integer.parseInt(rwParts[1]) : 0);
                    } catch (NumberFormatException ignored) {}
                }

                if (remainingMins <= 0) {
                    continue;
                }

                Date cursorDate = new Date();
                Calendar cal = Calendar.getInstance();
                cal.setTime(cursorDate);
                cal.set(Calendar.HOUR_OF_DAY, 0);
                cal.set(Calendar.MINUTE, 0);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                cursorDate = cal.getTime();

                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");

                while (remainingMins > 0) {
                    if (isNonWorkingDay(cursorDate)) {
                        cal.setTime(cursorDate);
                        cal.add(Calendar.DATE, 1);
                        cursorDate = cal.getTime();
                        continue;
                    }

                    String dateKey = sdf.format(cursorDate);
                    WorkloadDayDetail dayDetail = workload.computeIfAbsent(dateKey, k -> new WorkloadDayDetail(0, new ArrayList<>()));

                    int alreadyAllocated = dayDetail.getTotalMinutes();
                    int available = DAILY_CAPACITY - alreadyAllocated;

                    if (available <= 0) {
                        cal.setTime(cursorDate);
                        cal.add(Calendar.DATE, 1);
                        cursorDate = cal.getTime();
                        continue;
                    }

                    int used = Math.min(remainingMins, available);
                    dayDetail.setTotalMinutes(alreadyAllocated + used);

                    dayDetail.getTickets().add(new WorkloadTicketDetail(
                        t.getTicketId(),
                        t.getEmployeeName() != null ? t.getEmployeeName() : t.getCreatedBy(),
                        t.getTitle(),
                        used
                    ));

                    remainingMins -= used;

                    if (remainingMins > 0) {
                        cal.setTime(cursorDate);
                        cal.add(Calendar.DATE, 1);
                        cursorDate = cal.getTime();
                    }
                }
            }
            return ResponseEntity.ok(workload);
        } catch (Exception e) {
            log.error("Error fetching developer workload", e);
            return ResponseEntity.ok(Map.of());
        }
    }

    private List<String> moveTempFiles(List<String> tempPaths, String ticketId, Integer ticketRowId, String fileType, String subDirName) {
        List<String> finalPaths = new ArrayList<>();
        if (tempPaths == null || tempPaths.isEmpty()) {
            return finalPaths;
        }

        try {
            String destRelativeFolder = "Ticketing/" + ticketId + "/" + subDirName;
            Path rootPath = fileService.getRootPath();
            Path destFolder = rootPath.resolve(destRelativeFolder).normalize();

            for (String tempPath : tempPaths) {
                if (tempPath == null || tempPath.trim().isEmpty()) {
                    continue;
                }

                Path source = rootPath.resolve(tempPath.trim()).normalize();
                if (Files.exists(source) && !Files.isDirectory(source)) {
                    // Create dest folder
                    if (!Files.exists(destFolder)) {
                        Files.createDirectories(destFolder);
                    }

                    String fileName = source.getFileName().toString();
                    Path destFile = destFolder.resolve(fileName);
                    Files.move(source, destFile, StandardCopyOption.REPLACE_EXISTING);

                    String relativeDestPath = destRelativeFolder + "/" + fileName;
                    finalPaths.add(relativeDestPath);

                    // Create database record
                    String displayName = fileName;
                    int underIdx = fileName.indexOf('_');
                    if (underIdx != -1) {
                        displayName = fileName.substring(underIdx + 1);
                    }

                    SupportTicketAttachment attachment = SupportTicketAttachment.builder()
                            .ticketRowId(ticketRowId)
                            .ticketId(ticketId)
                            .fileName(displayName)
                            .filePath(relativeDestPath)
                            .fileType(fileType)
                            .uploadedBy(getCurrentUser())
                            .build();
                    attachmentRepository.save(attachment);
                } else {
                    // If source doesn't exist, check if it's already a final path (for ticket updates)
                    if (tempPath.contains("Ticketing/" + ticketId + "/")) {
                        finalPaths.add(tempPath.trim());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error moving temp files for ticket " + ticketId, e);
        }
        return finalPaths;
    }

    public static class WorkloadDayDetail {
        private int totalMinutes;
        private List<WorkloadTicketDetail> tickets;

        public WorkloadDayDetail() {
            this.tickets = new ArrayList<>();
        }

        public WorkloadDayDetail(int totalMinutes, List<WorkloadTicketDetail> tickets) {
            this.totalMinutes = totalMinutes;
            this.tickets = tickets;
        }

        public int getTotalMinutes() {
            return totalMinutes;
        }

        public void setTotalMinutes(int totalMinutes) {
            this.totalMinutes = totalMinutes;
        }

        public List<WorkloadTicketDetail> getTickets() {
            return tickets;
        }

        public void setTickets(List<WorkloadTicketDetail> tickets) {
            this.tickets = tickets;
        }
    }

    public static class WorkloadTicketDetail {
        private String ticketId;
        private String employeeName;
        private String title;
        private int allocatedMinutes;

        public WorkloadTicketDetail() {}

        public WorkloadTicketDetail(String ticketId, String employeeName, String title, int allocatedMinutes) {
            this.ticketId = ticketId;
            this.employeeName = employeeName;
            this.title = title;
            this.allocatedMinutes = allocatedMinutes;
        }

        public String getTicketId() {
            return ticketId;
        }

        public void setTicketId(String ticketId) {
            this.ticketId = ticketId;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public void setEmployeeName(String employeeName) {
            this.employeeName = employeeName;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public int getAllocatedMinutes() {
            return allocatedMinutes;
        }

        public void setAllocatedMinutes(int allocatedMinutes) {
            this.allocatedMinutes = allocatedMinutes;
        }
    }

    @PostMapping("/transcribe")
    @Operation(summary = "Transcribe uploaded voice recording")
    public ResponseEntity<?> transcribeVoiceRecording(
            @RequestParam("file") MultipartFile file, 
            @RequestParam(value = "language", required = false) String language,
            @RequestParam(value = "transcribedText", required = false) String transcribedText) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Audio file is empty or not provided."));
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid file name."));
        }
        
        String ext = "";
        int idx = originalFilename.lastIndexOf('.');
        if (idx > 0) {
            ext = originalFilename.substring(idx + 1).toLowerCase();
        }
        
        if (!Arrays.asList("mp3", "wav", "m4a", "aac", "webm", "ogg").contains(ext)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid audio format. Supported formats: MP3, WAV, M4A, AAC."));
        }
        
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        String resultText = (transcribedText != null) ? transcribedText : "";
        
        return ResponseEntity.ok(Map.of(
            "text", resultText,
            "filename", originalFilename,
            "detectedLanguage", (language != null) ? language : "en-in"
        ));
    }

    private void logStatusHistory(Integer ticketRowId, String activityName, String commentText, String fromStatus, String toStatus, String assignedUser, String targetDateChanges) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("activityName", activityName);
            payload.put("comment", commentText != null ? commentText : "");
            payload.put("fromStatus", fromStatus);
            payload.put("toStatus", toStatus);
            payload.put("assignedUser", assignedUser);
            payload.put("targetDateChanges", targetDateChanges);
            
            String jsonComment = objectMapper.writeValueAsString(payload);
            
            String finalFrom = fromStatus;
            String finalTo = toStatus;
            
            if (finalTo == null) {
                Optional<TicketTraceabilityCenter> tOpt = ticketRepository.findById(ticketRowId);
                if (tOpt.isPresent()) {
                    finalTo = tOpt.get().getTicketStatus();
                }
            }
            if (finalTo == null) {
                finalTo = "Open";
            }
            
            SupportTicketStatusHistory history = SupportTicketStatusHistory.builder()
                    .ticketRowId(ticketRowId)
                    .fromStatus(finalFrom)
                    .toStatus(finalTo)
                    .updatedBy(getCurrentUser())
                    .comment(jsonComment)
                    .build();
            statusHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to log status history for ticket ID: " + ticketRowId, e);
        }
    }
}
