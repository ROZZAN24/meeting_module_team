package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_EMERGENCY_CONTACT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "CONTACT_NAME", length = 100)
    private String contactName;

    @Column(name = "RELATION", length = 50)
    private String relation;

    @Column(name = "ADDRESS1", length = 255)
    private String address1;

    @Column(name = "ADDRESS2", length = 255)
    private String address2;

    @Column(name = "MOBILE_NUMBER", length = 20)
    private String mobileNumber;

    @Column(name = "HOME_PHONE_NUMBER", length = 20)
    private String homePhoneNumber;

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
