package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_KYC_DOCUMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeKycDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "SEQ_NO")
    private Integer seqNo;

    @Column(name = "DOCUMENT_NAME", length = 255)
    private String documentName;

    @Column(name = "DOCUMENT_NUMBER", length = 100)
    private String documentNumber;

    @Column(name = "ATTACHMENT", length = 500)
    private String attachment;

    @Column(name = "FILE_NAME", length = 255)
    private String fileName;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Column(name = "CREATED_BY", length = 100)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 100)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() { createdDate = new Date(); }

    @PreUpdate
    protected void onUpdate() { updatedDate = new Date(); }
}
