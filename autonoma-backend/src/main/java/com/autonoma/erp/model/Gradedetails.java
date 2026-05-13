package com.autonoma.erp.model;

import java.util.Date;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "HRM_GRADE_DETAILS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Gradedetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "GRADE_CODE", length = 50)
    private String gradeCode;

    @Column(name = "SEQ_NO")
    private String sequenceNo;

    @Column(name = "GRADE_NAME", length = 100)
    private String gradeName;

    @Column(name = "STATUS", length = 20)
    private String status = "Active";

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
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
