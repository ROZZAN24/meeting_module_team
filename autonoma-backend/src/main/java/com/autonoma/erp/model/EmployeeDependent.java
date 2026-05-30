package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_DEPENDENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDependent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "RELATION_NAME", length = 100)
    private String name;

    @Column(name = "GENDER", length = 20)
    private String gender;

    @Column(name = "DATE_OF_BIRTH")
    @Temporal(TemporalType.DATE)
    private Date dob;

    @Column(name = "RELATIONSHIP", length = 50)
    private String relationship;

    @Column(name = "OCCUPATION", length = 100)
    private String occupation;

    @Column(name = "BLOOD_GROUP", length = 20)
    private String bloodGroup;

    @Column(name = "CONTACT_NUMBER1", length = 20)
    private String contactNo;

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
