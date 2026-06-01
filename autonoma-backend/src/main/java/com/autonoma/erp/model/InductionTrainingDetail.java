package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_INDUCTION_TRAINING")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InductionTrainingDetail extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ASSIGNMENT_ID", nullable = false)
    private Long assignmentId;

    @Column(name = "INDUCTION_MASTER_ID", nullable = false)
    private Long inductionMasterId;

    // === Trainer fills these ===
    @Column(name = "TRAINER_STATUS", length = 20)
    private String trainerStatus = "PENDING"; // PENDING, COMPLETED

    @Column(name = "TRAINER_COMMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String trainerComments;

    @Column(name = "SKILL_RATING")
    private Integer skillRating; // 1-5

    // === Trainee fills these ===
    @Column(name = "TRAINEE_STATUS", length = 20)
    private String traineeStatus; // UNDERSTOOD, NEED MORE TRAINING

    @Column(name = "TRAINEE_COMMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String traineeComments;

    // === Attachment ===
    @Column(name = "ATTACHMENT_PATH", length = 1000)
    private String attachmentPath;

    // === Transient: loaded from InductionMaster for display ===
    @Transient
    private String inductionDetails;

    @Transient
    private String answer;

    @Transient
    private String inductionRound;

    @Transient
    private String attachmentRequired;

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
