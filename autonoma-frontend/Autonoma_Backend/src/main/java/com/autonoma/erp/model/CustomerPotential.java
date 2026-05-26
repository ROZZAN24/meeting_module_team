package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "sm_customer_potential")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPotential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_group_name", length = 200)
    private String customerGroupName;

    @Column(name = "customer_code", nullable = false, length = 50)
    private String customerCode;

    @Column(name = "customer_type", length = 50)
    private String customerType;

    @Column(name = "manufacturer_oem", length = 100)
    private String manufacturerOem;

    @Column(name = "wtg_model", length = 100)
    private String wtgModel;

    @Column(name = "wind_turbine_power", length = 100)
    private String windTurbinePower;

    @Column(name = "wind_farm_name", length = 100)
    private String windFarmName;

    @Column(name = "area", length = 200)
    private String area;

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "developer", length = 200)
    private String developer;

    @Column(name = "plant_mw")
    private Double plantMw;

    @Column(name = "turbine_count")
    private Integer turbineCount;

    @Column(name = "hub", length = 100)
    private String hub;

    @Column(name = "operational_status", length = 100)
    private String operationalStatus;

    @Column(name = "commissioning_year", length = 20)
    private String commissioningYear;

    @Column(name = "commissioning_month", length = 20)
    private String commissioningMonth;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "status")
    @Builder.Default
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
