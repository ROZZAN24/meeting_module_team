package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_INDUCTION_REASSIGNMENT_LOG")
@Data
@NoArgsConstructor
public class InductionReassignmentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TRAINEE_NAME", length = 200)
    private String traineeName;

    @Column(name = "TRAINEE_EMP_CODE", length = 50)
    private String traineeEmpCode;

    @Column(name = "INDUCTION_ROUND", length = 50)
    private String inductionRound;

    @Column(name = "PREVIOUS_ASSESSOR", length = 200)
    private String previousAssessor;

    @Column(name = "PREVIOUS_ASSESSOR_EMP_CODE", length = 50)
    private String previousAssessorEmpCode;

    @Column(name = "NEW_ASSESSOR", length = 200)
    private String newAssessor;

    @Column(name = "NEW_ASSESSOR_EMP_CODE", length = 50)
    private String newAssessorEmpCode;

    @Column(name = "REASSIGNMENT_REASON", columnDefinition = "NVARCHAR(MAX)")
    private String reassignmentReason;

    @Column(name = "REASSIGNED_BY", length = 100)
    private String reassignedBy;

    @Column(name = "REASSIGNED_DATE_TIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date reassignedDateTime;
}
