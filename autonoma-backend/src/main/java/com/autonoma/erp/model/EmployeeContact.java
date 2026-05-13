package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HRM_EMP_CONTACT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    // Permanent Address
    @Column(name = "perm_address1", length = 255)
    private String permAddress1;

    @Column(name = "perm_address2", length = 255)
    private String permAddress2;

    @Column(name = "perm_city", length = 100)
    private String permCity;

    @Column(name = "perm_state", length = 100)
    private String permState;

    @Column(name = "perm_pin_code", length = 20)
    private String permPinCode;

    @Column(name = "perm_phone", length = 20)
    private String permPhone;

    @Column(name = "perm_mobile", length = 20)
    private String permMobile;

    // Communication Address
    @Column(name = "comm_address1", length = 255)
    private String commAddress1;

    @Column(name = "comm_address2", length = 255)
    private String commAddress2;

    @Column(name = "comm_city", length = 100)
    private String commCity;

    @Column(name = "comm_state", length = 100)
    private String commState;

    @Column(name = "comm_pin_code", length = 20)
    private String commPinCode;

    @Column(name = "comm_phone", length = 20)
    private String commPhone;

    @Column(name = "comm_mobile", length = 20)
    private String commMobile;

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
