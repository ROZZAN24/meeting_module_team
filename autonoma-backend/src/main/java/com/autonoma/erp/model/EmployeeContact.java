package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_CONTACT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "MOBILE", length = 20)
    private String mobile;

    @Column(name = "ALTERNATE_MOBILE", length = 20)
    private String alternateMobile;

    // Permanent Address
    @Column(name = "PERM_ADDRESS1", length = 500)
    private String address;

    @Column(name = "PERM_CITY", length = 100)
    private String city;

    @Column(name = "PERM_STATE", length = 100)
    private String state;

    @Column(name = "PERM_COUNTRY", length = 100)
    private String country;

    @Column(name = "PERM_PIN_CODE", length = 20)
    private String pincode;

    // Communication Address
    @Column(name = "COMM_ADDRESS1", length = 500)
    private String commAddress;

    @Column(name = "COMM_CITY", length = 100)
    private String commCity;

    @Column(name = "COMM_STATE", length = 100)
    private String commState;

    @Column(name = "COMM_COUNTRY", length = 100)
    private String commCountry;

    @Column(name = "COMM_PIN_CODE", length = 20)
    private String commPincode;

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
