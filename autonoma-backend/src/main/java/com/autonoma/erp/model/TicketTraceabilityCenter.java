package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "ticket_Tracability_center")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketTraceabilityCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Integer rowId;

    @Column(name = "ticket_id", nullable = false, unique = true, length = 50)
    private String ticketId;

    @Column(name = "ticket_type", nullable = false, length = 50)
    private String ticketType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "page_id")
    private Integer pageId;

    @Column(name = "employee_code", length = 50)
    private String employeeCode;

    @Column(name = "employee_name", length = 100)
    private String employeeName;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "mobile_no", length = 50)
    private String mobileNo;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "priority_level", length = 50)
    private String priorityLevel;

    @Column(name = "severity_level", length = 50)
    private String severityLevel;

    @Column(name = "ticket_status", nullable = false, length = 50)
    private String ticketStatus;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "assigned_by", length = 100)
    private String assignedBy;

    @Column(name = "developer_name", length = 100)
    private String developerName;

    @Column(name = "developer_email", length = 100)
    private String developerEmail;

    @Column(name = "developer_mobile_no", length = 50)
    private String developerMobileNo;

    @Column(name = "due_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dueDate;

    @Column(name = "target_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date targetDate;

    @Column(name = "taken_time", length = 100)
    private String takenTime;

    @Column(name = "rework_time", length = 100)
    private String reworkTime;

    @Column(name = "assigned_hours", length = 50)
    private String assignedHours;

    @Column(name = "due_date_reason", columnDefinition = "NVARCHAR(MAX)")
    private String dueDateReason;

    @Column(name = "resolved_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date resolvedAt;

    @Column(name = "closed_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date closedAt;

    @Column(name = "reopened_count", nullable = false)
    private int reopenedCount;

    @Column(name = "resolution_summary", columnDefinition = "NVARCHAR(MAX)")
    private String resolutionSummary;

    @Column(name = "root_cause", columnDefinition = "NVARCHAR(MAX)")
    private String rootCause;

    @Column(name = "source_type", length = 100)
    private String sourceType;

    @Column(name = "attachment_path", length = 500)
    private String attachmentPath;

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @Transient
    private List<String> tempAttachments;

    @Transient
    private List<String> tempVoiceRecordings;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        if (this.ticketStatus == null || this.ticketStatus.trim().isEmpty()) {
            this.ticketStatus = "Open";
        }
        if (this.createdBy == null || this.createdBy.trim().isEmpty()) {
            this.createdBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
            if (this.createdBy == null || this.createdBy.trim().isEmpty()) {
                this.createdBy = "System";
            }
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
        this.updatedBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        if (this.updatedBy == null || this.updatedBy.trim().isEmpty()) {
            this.updatedBy = "System";
        }
    }
}
