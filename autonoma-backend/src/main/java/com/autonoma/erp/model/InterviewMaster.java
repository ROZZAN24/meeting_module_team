package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "IND_INTERVIEW_MASTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "criteria_details", length = 300, nullable = false)
    private String criteriaDetails;

    @Column(name = "answer", length = 2000, nullable = false)
    private String answer;

    @Column(name = "department_codes", length = 500)
    private String departmentCodes; // Comma separated list of department codes

    @Column(name = "level_codes", length = 500)
    private String levelCodes; // Comma separated list of levels (L1, L2, etc.)

    @Column(name = "interview_round")
    private String interviewRound; // TECHNICAL, HR, MANAGEMENT, SPECIAL ROUND

    @Column(name = "attachment_required")
    private String attachmentRequired; // YES, NO

    @Column(name = "interview_attachment", columnDefinition = "NVARCHAR(MAX)")
    private String interviewAttachment;

    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE
}
