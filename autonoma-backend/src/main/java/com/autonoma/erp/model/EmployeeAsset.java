package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_ASSET")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "ASSET_ID", length = 50)
    private String assetId;

    @Column(name = "ASSET_NAME", length = 255)
    private String assetName;

    @Column(name = "ASSET_VALUE", precision = 12, scale = 2)
    private BigDecimal assetValue;

    @Column(name = "ISSUE_DATE")
    @Temporal(TemporalType.DATE)
    private Date issueDate;

    @Column(name = "CONDITION_OF_ASSET", length = 100)
    private String condition;

    @Column(name = "QTY")
    private Integer qty;

    @Column(name = "SERIAL_NO", length = 100)
    private String serialNo;

    @Column(name = "VALUE", precision = 12, scale = 2)
    private BigDecimal value;

    @Column(name = "COMMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String comments;

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
