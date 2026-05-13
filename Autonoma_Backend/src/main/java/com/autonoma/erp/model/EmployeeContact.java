package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "hrm_employee_contact")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "mobile", length = 20)
    private String mobile;

    @Column(name = "alternate_mobile", length = 20)
    private String alternateMobile;

    // Permanent Address
    @Column(name = "perm_address1", length = 500)
    private String address;

    @Column(name = "perm_city", length = 100)
    private String city;

    @Column(name = "perm_state", length = 100)
    private String state;

    @Column(name = "perm_country", length = 100)
    private String country;

    @Column(name = "perm_pin_code", length = 20)
    private String pincode;

    // Communication Address
    @Column(name = "comm_address1", length = 500)
    private String commAddress;

    @Column(name = "comm_city", length = 100)
    private String commCity;

    @Column(name = "comm_state", length = 100)
    private String commState;

    @Column(name = "comm_country", length = 100)
    private String commCountry;

    @Column(name = "comm_pin_code", length = 20)
    private String commPincode;

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
