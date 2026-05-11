package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Table(name = "audit_attendance")
@Data
public class AuditAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "audit_schedule_no", columnDefinition = "NVARCHAR(50)")
    private String auditScheduleNo;

    @Column(name = "name", columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(name = "in_time", columnDefinition = "NVARCHAR(50)")
    private String inTime;

    @Column(name = "out_time", columnDefinition = "NVARCHAR(50)")
    private String outTime;

    @Column(name = "attendance_status", columnDefinition = "NVARCHAR(50)")
    private String attendanceStatus;

    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();

    @Column(name = "updated_by")
    private String updatedBy;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
