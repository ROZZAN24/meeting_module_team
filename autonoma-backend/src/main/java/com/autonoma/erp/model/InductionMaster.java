package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_INDUCTION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InductionMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "INDUCTION_DETAILS", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String inductionDetails;

    @Column(name = "ANSWER", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String answer;

    @Column(name = "DEPARTMENT_CODES", length = 100)
    private String departmentCodes; // Comma separated list of department codes

    @Column(name = "LEVEL_CODES", length = 100)
    private String levelCodes; // Comma separated list of levels (L1, L2, etc.)

    @Column(name = "INDUCTION_ROUND")
    private String inductionRound; // HR, QMS, DEPARTMENT, MANAGEMENT

    @Column(name = "ATTACHMENT_REQUIRED")
    private String attachmentRequired; // YES, NO

    @Column(name = "INDUCTION_ATTACHMENT", length = 1000)
    private String inductionAttachment;

    @Column(name = "STATUS", length = 20)
    private String status; // ACTIVE, IN ACTIVE

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
