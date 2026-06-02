package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Division Master — stored in the MASTER (AUTONOMA) database.
 * Each division belongs to a CompanyCredential (company), identified by
 * companyId (FK → ad_company_credential.id).
 *
 * Divisional transactions in tenant databases reference the division_id
 * via the BaseDivisionTenantEntity filter.
 */
@Entity
@Table(name = "AD_DIVISION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Division {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * FK to ad_company_credential — which company this division belongs to.
     * NOT a JPA join; kept as plain Long to avoid cross-DB FK constraints.
     */
    @Column(name = "COMPANY_ID", nullable = false)
    private Long companyId;

    /**
     * Company name — NOT persisted; fetched at query-time from
     * ad_company_credential.
     * Populated by DivisionService before returning to the API caller.
     */
    @Transient
    private String companyName;

    @Column(name = "DIVISION_NAME", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String divisionName;

    @Column(name = "DESCRIPTION", columnDefinition = "NVARCHAR(250)")
    private String description;

    @Column(name = "ADDRESS", columnDefinition = "NVARCHAR(500)")
    private String address;

    @Column(name = "CITY", columnDefinition = "NVARCHAR(50)")
    private String city;

    @Column(name = "STATE", columnDefinition = "NVARCHAR(50)")
    private String state;

    @Column(name = "COUNTRY", columnDefinition = "NVARCHAR(50)")
    private String country;

    @Column(name = "PINCODE", columnDefinition = "NVARCHAR(10)")
    private String pincode;

    @Column(name = "GST_IN", columnDefinition = "NVARCHAR(15)")
    private String gstIn;

    @Column(name = "STATE_CODE")
    private Integer stateCode;

    @Column(name = "SEQUENCE_NO")
    private Integer sequenceNo = 0;

    @Column(name = "STATUS", nullable = false)
    private Boolean status = true; // true = 1 = Active, false = 0 = Inactive

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdDate = new Date();
        if (createdBy == null || createdBy.isEmpty()) createdBy = "Admin";
        if (isActive == null) isActive = true;
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        updatedDate = new Date();
        if (updatedBy == null || updatedBy.isEmpty()) updatedBy = "Admin";
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

