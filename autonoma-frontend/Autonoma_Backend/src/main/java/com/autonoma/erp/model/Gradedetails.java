package com.autonoma.erp.model;

import java.util.Date;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hrm_grade_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Gradedetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "grade_code", length = 50)
    private String gradeCode;

    @Column(name = "seq_no")
    private String sequenceNo;

    @Column(name = "grade_name", length = 100)
    private String gradeName;

    @Column(name = "status", length = 20)
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
        if (status == null) status = "Active";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
