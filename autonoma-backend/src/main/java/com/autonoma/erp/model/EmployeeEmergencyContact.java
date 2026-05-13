package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HRM_EMP_EMERGENCY_CONTACT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "contact_name", length = 100)
    private String contactName;

    @Column(length = 50)
    private String relation;

    @Column(length = 255)
    private String address1;

    @Column(length = 255)
    private String address2;

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;

    @Column(name = "home_phone_number", length = 20)
    private String homePhoneNumber;

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
