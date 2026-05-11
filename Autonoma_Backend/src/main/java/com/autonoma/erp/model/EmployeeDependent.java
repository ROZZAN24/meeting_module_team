package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "hrm_employee_dependent")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDependent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "relation_name", length = 100)
    private String relationName;

    @Column(length = 50)
    private String relation;

    @Column(length = 20)
    private String gender;

    @Column(name = "marital_status", length = 30)
    private String maritalStatus;

    @Column(name = "aadhar_id", length = 20)
    private String aadharId;

    @Column(name = "contact_number1", length = 20)
    private String contactNumber1;

    @Column(name = "contact_number2", length = 20)
    private String contactNumber2;

    @Column(name = "contact_address", length = 500)
    private String contactAddress;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() { createdDate = new Date(); }

    @PreUpdate
    protected void onUpdate() { updatedDate = new Date(); }
}
