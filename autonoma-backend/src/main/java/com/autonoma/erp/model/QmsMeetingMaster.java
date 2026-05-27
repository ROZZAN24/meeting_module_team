package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "QMS_MEETING_MASTER")
public class QmsMeetingMaster extends BaseAuditEntity {
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





    @Column(name = "attachment_name")
    private String attachmentName;

    @Column(name = "attachment_url")
    private String attachmentUrl;
}
