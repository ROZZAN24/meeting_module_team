package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HRM_EMP_EDUCATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(length = 100)
    private String education;

    @Column(name = "institution_name", length = 255)
    private String institutionName;

    @Column(length = 50)
    private String type;

    @Column(name = "year_of_passing", length = 10)
    private String yearOfPassing;

    @Column(name = "percentage_grade", length = 20)
    private String percentageGrade;

    @Column(length = 500)
    private String documents;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() { createdDate = new Date(); }

    @PreUpdate
    protected void onUpdate() { updatedDate = new Date(); }
}
