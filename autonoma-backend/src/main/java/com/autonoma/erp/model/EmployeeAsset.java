package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hrm_employee_asset")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "asset_id", length = 50)
    private String assetId;

    @Column(name = "asset_name", length = 255)
    private String assetName;

<<<<<<< HEAD
    @Column(name = "asset_value", precision = 12, scale = 2)
    private BigDecimal assetValue;

=======
>>>>>>> origin/main

    @Column(name = "issue_date")
    @Temporal(TemporalType.DATE)
    private Date issueDate;

    @Column(name = "condition_of_asset", length = 100)
    private String condition;

    @Column(name = "qty")
    private Integer qty;

    @Column(name = "serial_no", length = 100)
    private String serialNo;

    @Column(precision = 12, scale = 2)
    private BigDecimal value;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String comments;

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
