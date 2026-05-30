package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_INDUCTION_ASSIGNMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InductionAssignment extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMP_CODE", nullable = false)
    private String empCode;

    @Column(name = "EMP_NAME")
    private String empName;

    @Column(name = "OLD_EMP_CODE")
    private String oldEmpCode;

    @Column(name = "DEPARTMENT")
    private String department;

    @Column(name = "DESIGNATION")
    private String designation;

    @Column(name = "INDUCTION_ROUND", nullable = false)
    private String inductionRound; // HR, QMS, DEPARTMENT, MANAGEMENT

    @Column(name = "SCREENING_LEVEL", nullable = false)
    private String screeningLevel; // Level 1, 2, 3, 4

    @Column(name = "INDUCTION_DATE", nullable = false)
    @Temporal(TemporalType.DATE)
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private Date inductionDate;

    @Column(name = "INDUCTION_TIME", nullable = false)
    private String inductionTime;

    @Column(name = "TRAINER_NAME", nullable = false)
    private String trainerName; // Induction Person

    @Column(name = "CURRENT_STATUS")
    private String currentStatus; // PENDING, RESCHEDULE, TRAINING GIVEN, COMPLETED

    @Column(name = "INDUCTION_STATUS", length = 20)
    private String inductionStatus; // ACTIVE, IN ACTIVE

    @Column(name = "REMARKS", columnDefinition = "NVARCHAR(MAX)")
    private String remarks;

    @Column(name = "TRAINER_EMP_CODE", length = 50)
    private String trainerEmpCode;

    @Column(name = "AVERAGE_RATING")
    private Double averageRating;

    @Column(name = "TRAINING_STARTED_AT")
    @Temporal(TemporalType.TIMESTAMP)
    private Date trainingStartedAt;

    @Column(name = "TRAINING_COMPLETED_AT")
    @Temporal(TemporalType.TIMESTAMP)
    private Date trainingCompletedAt;

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
