package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "hrm_applicant_interview")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HraApplicantInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "screening_level", length = 50)
    private String screeningLevel;

    @Column(name = "round", length = 50)
    private String round;

    @Column(name = "interview_date", length = 50)
    private String interviewDate;

    @Column(name = "start_time", length = 20)
    private String startTime;

    @Column(name = "end_time", length = 20)
    private String endTime;

    @Column(name = "interview_person", length = 255)
    private String interviewPerson;

    @Column(name = "interview_status", length = 50)
    private String interviewStatus = "PENDING";

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();

    @Column(name = "status", length = 50)
    private String status = "ACTIVE";

    @Column(name = "is_active")
    private Boolean isActive = true;
}
