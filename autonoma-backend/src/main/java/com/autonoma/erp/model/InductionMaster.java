package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "IND_INDUCTION_MASTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InductionMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "induction_details", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String inductionDetails;

    @Column(name = "answer", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String answer;

    @Column(name = "department_codes", length = 100)
    private String departmentCodes; // Comma separated list of department codes

    @Column(name = "level_codes", length = 100)
    private String levelCodes; // Comma separated list of levels (L1, L2, etc.)

    @Column(name = "induction_round")
    private String inductionRound; // HR, QMS, DEPARTMENT, MANAGEMENT

    @Column(name = "attachment_required")
    private String attachmentRequired; // YES, NO

    @Column(name = "induction_attachment", columnDefinition = "NVARCHAR(MAX)")
    private String inductionAttachment;

    @Column(name = "status", length = 20)
    private String status; // ACTIVE, IN ACTIVE




}
