package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "QMS_MEETING")
public class QmsMeetingMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "MEETING_NAME", nullable = false)
    private String meetingName;

    @Column(name = "MEETING_DESCRIPTION", columnDefinition = "NVARCHAR(MAX)")
    private String meetingDescription;

    @Column(name = "MEETING_PREFIX", nullable = false)
    private String meetingPrefix;

    @Column(name = "MEETING_AGENDA", columnDefinition = "NVARCHAR(MAX)")
    private String meetingAgenda;

    @Column(name = "EMPLOYEE_NAME")
    private String employeeName;

    @Column(name = "STATUS")
    private String status = "ACTIVE";

    @Column(name = "ATTACHMENT_NAME")
    private String attachmentName;

    @Column(name = "ATTACHMENT_URL", length = 1000)
    private String attachmentUrl;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
