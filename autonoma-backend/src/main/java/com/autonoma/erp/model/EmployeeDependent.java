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
    private String name;

    @Column(length = 20)
    private String gender;

    @Column(name = "date_of_birth")
    @Temporal(TemporalType.DATE)
    private Date dob;

    @Column(length = 50)
    private String relationship;

    @Column(length = 100)
    private String occupation;

    @Column(name = "blood_group", length = 20)
    private String bloodGroup;

    @Column(name = "contact_number1", length = 20)
    private String contactNo;

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
