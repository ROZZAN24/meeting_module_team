package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "hrm_department_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dept_no", nullable = false, length = 50)
    private String departmentNo = "";

    @Column(name = "dept_name", nullable = false, length = 100)
    private String departmentName;

    @Column(name = "nda_certificate", length = 10)
    private String ndaCertificate = "No";

    @Column(name = "seq_no")
    private Integer sequenceNo = 0;

    @Column(name = "status")
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
        if (createdBy == null) {
            createdBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
        updatedBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
    }
}
