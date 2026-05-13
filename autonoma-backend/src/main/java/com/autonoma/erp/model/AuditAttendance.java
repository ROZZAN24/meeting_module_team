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

    @Column(columnDefinition = "NVARCHAR(50)")
    private String auditScheduleNo;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String inTime;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String outTime;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String attendanceStatus;

    private String createdBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();

    private String updatedBy;
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
