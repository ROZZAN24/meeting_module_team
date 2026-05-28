package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "IND_INDUCTION_TRAINING_DETAIL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InductionTrainingDetail extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "induction_master_id", nullable = false)
    private Long inductionMasterId;

    // === Trainer fills these ===
    @Column(name = "trainer_status", length = 50)
    private String trainerStatus = "PENDING"; // PENDING, COMPLETED

    @Column(name = "trainer_comments", length = 1000)
    private String trainerComments;

    @Column(name = "skill_rating")
    private Integer skillRating; // 1-5

    // === Trainee fills these ===
    @Column(name = "trainee_status", length = 50)
    private String traineeStatus; // UNDERSTOOD, NEED MORE TRAINING

    @Column(name = "trainee_comments", length = 1000)
    private String traineeComments;

    // === Attachment ===
    @Column(name = "attachment_path", columnDefinition = "NVARCHAR(MAX)")
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

    // === Audit ===



}
