package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "SLS_CUSTOMER_ADDRESS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CUSTOMER_ID", nullable = false)
    private Long customerId;

    @Column(name = "CUSTOMER_NAME", length = 200)
    private String customerName;

    @Column(name = "INVOICE_NAME", length = 200)
    private String invoiceName;

    @Column(name = "SHIPMENT", length = 100)
    private String shipment;

    @Column(name = "ADDRESS", columnDefinition = "TEXT")
    private String address;

    @Column(name = "CITY", length = 100)
    private String city;

    @Column(name = "DISTRICT", length = 100)
    private String district;

    @Column(name = "STATE", length = 100)
    private String state;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "PINCODE", length = 20)
    private String pincode;

    @Column(name = "DISTANCE")
    private Double distance;

    @Column(name = "CONTACT_NAME", length = 200)
    private String contactName;

    @Column(name = "CONTACT_NO", length = 50)
    private String contactNo;

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
    @com.fasterxml.jackson.annotation.JsonProperty("createdAt")
    public Date getCreatedAt() {
        return this.createdDate;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdDate = createdAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedAt")
    public Date getUpdatedAt() {
        return this.updatedDate;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedDate = updatedAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("createdUser")
    public String getCreatedUser() {
        return this.createdBy;
    }

    public void setCreatedUser(String createdUser) {
        this.createdBy = createdUser;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedUser")
    public String getUpdatedUser() {
        return this.updatedBy;
    }

    public void setUpdatedUser(String updatedUser) {
        this.updatedBy = updatedUser;
    }
}
