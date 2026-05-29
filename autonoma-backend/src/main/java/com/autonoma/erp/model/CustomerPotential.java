package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "SLS_CUSTOMER_POTENTIAL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPotential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CUSTOMER_GROUP_NAME", length = 200)
    private String customerGroupName;

    @Column(name = "CUSTOMER_CODE", nullable = false, length = 50)
    private String customerCode;

    @Column(name = "CUSTOMER_TYPE", length = 50)
    private String customerType;

    @Column(name = "MANUFACTURER_OEM", length = 100)
    private String manufacturerOem;

    @Column(name = "WTG_MODEL", length = 100)
    private String wtgModel;

    @Column(name = "WIND_TURBINE_POWER", length = 100)
    private String windTurbinePower;

    @Column(name = "WIND_FARM_NAME", length = 100)
    private String windFarmName;

    @Column(name = "AREA", length = 200)
    private String area;

    @Column(name = "PINCODE", length = 20)
    private String pincode;

    @Column(name = "STATE", length = 100)
    private String state;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "DEVELOPER", length = 200)
    private String developer;

    @Column(name = "PLANT_MW")
    private Double plantMw;

    @Column(name = "TURBINE_COUNT")
    private Integer turbineCount;

    @Column(name = "HUB", length = 100)
    private String hub;

    @Column(name = "OPERATIONAL_STATUS", length = 100)
    private String operationalStatus;

    @Column(name = "COMMISSIONING_YEAR", length = 20)
    private String commissioningYear;

    @Column(name = "COMMISSIONING_MONTH", length = 20)
    private String commissioningMonth;

    @Column(name = "LATITUDE")
    private Double latitude;

    @Column(name = "LONGITUDE")
    private Double longitude;

    @Column(name = "STATUS")
    @Builder.Default
    private String status = "Active";

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "IS_ACTIVE")
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
        if (createdBy == null) createdBy = "Admin";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
        if (updatedBy == null) updatedBy = "Admin";
    }

    // Backward-compatible aliases
    public Date getCreatedAt() {
        return this.createdDate;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdDate = createdAt;
    }

    public Date getUpdatedAt() {
        return this.updatedDate;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedDate = updatedAt;
    }
}
