package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "hr_induction_assignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InductionAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emp_code", nullable = false)
    private String empCode;

    @Column(name = "emp_name")
    private String empName;

    @Column(name = "old_emp_code")
    private String oldEmpCode;

    @Column(name = "department")
    private String department;

    @Column(name = "designation")
    private String designation;

    @Column(name = "induction_round", nullable = false)
    private String inductionRound; // HR, QMS, DEPARTMENT, MANAGEMENT

    @Column(name = "screening_level", nullable = false)
    private String screeningLevel; // Level 1, 2, 3, 4

    @Column(name = "induction_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date inductionDate;

    @Column(name = "induction_time", nullable = false)
    private String inductionTime;

    @Column(name = "trainer_name", nullable = false)
    private String trainerName; // Induction Person

    @Column(name = "current_status")
    private String currentStatus; // PENDING, RESCHEDULE, TRAINING GIVEN, COMPLETED

    @Column(name = "induction_status")
    private String inductionStatus; // ACTIVE, IN ACTIVE

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @Column(name = "trainer_emp_code", length = 50)
    private String trainerEmpCode;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "training_started_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date trainingStartedAt;

    @Column(name = "training_completed_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date trainingCompletedAt;


    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
}
