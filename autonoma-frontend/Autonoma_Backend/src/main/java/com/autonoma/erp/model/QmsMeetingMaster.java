package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "qms_meeting_master")
public class QmsMeetingMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "meeting_name", nullable = false)
    private String meetingName;

    @Column(name = "meeting_description", columnDefinition = "NVARCHAR(MAX)")
    private String meetingDescription;

    @Column(name = "meeting_prefix", nullable = false)
    private String meetingPrefix;

    @Column(name = "meeting_agenda", columnDefinition = "NVARCHAR(MAX)")
    private String meetingAgenda;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "status")
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;
}
