package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HRM_EMP_KYC_DOCUMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeKycDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "seq_no")
    private Integer seqNo;

    @Column(name = "document_name", length = 255)
    private String documentName;

    @Column(name = "document_number", length = 100)
    private String documentNumber;

    @Column(length = 500)
    private String attachment;

    @Column(name = "file_name", length = 255)
    private String fileName;

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
