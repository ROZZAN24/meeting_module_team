package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_INTERVIEW")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CRITERIA_DETAILS", length = 300, nullable = false)
    private String criteriaDetails;

    @Column(name = "ANSWER", length = 2000, nullable = false)
    private String answer;

    @Column(name = "DEPARTMENT_CODES", length = 500)
    private String departmentCodes; // Comma separated list of department codes

    @Column(name = "LEVEL_CODES", length = 500)
    private String levelCodes; // Comma separated list of levels (L1, L2, etc.)

    @Column(name = "INTERVIEW_ROUND")
    private String interviewRound; // TECHNICAL, HR, MANAGEMENT, SPECIAL ROUND

    @Column(name = "ATTACHMENT_REQUIRED")
    private String attachmentRequired; // YES, NO

    @Column(name = "INTERVIEW_ATTACHMENT", length = 1000)
    private String interviewAttachment;

    @Column(name = "STATUS")
    private String status; // ACTIVE, INACTIVE

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    // Explicit getter/setter for isActive
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
