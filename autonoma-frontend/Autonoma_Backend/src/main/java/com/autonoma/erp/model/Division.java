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
@Table(name = "ad_division_master")
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
    @Column(name = "company_id", nullable = false)
    private Long companyId;

    /**
     * Company name — NOT persisted; fetched at query-time from
     * ad_company_credential.
     * Populated by DivisionService before returning to the API caller.
     */
    @Transient
    private String companyName;

    @Column(name = "division_name", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String divisionName;

    @Column(name = "description", columnDefinition = "NVARCHAR(250)")
    private String description;

    @Column(name = "address", columnDefinition = "NVARCHAR(500)")
    private String address;

    @Column(name = "city", columnDefinition = "NVARCHAR(50)")
    private String city;

    @Column(name = "state", columnDefinition = "NVARCHAR(50)")
    private String state;

    @Column(name = "country", columnDefinition = "NVARCHAR(50)")
    private String country;

    @Column(name = "pincode", columnDefinition = "NVARCHAR(10)")
    private String pincode;

    @Column(name = "gst_in", columnDefinition = "NVARCHAR(15)")
    private String gstIn;

    @Column(name = "state_cd")
    private Integer stateCode;

    @Column(name = "seq_no")
    private Integer sequenceNo = 0;

    @Column(name = "status", nullable = false)
    private Boolean status = true; // true = 1 = Active, false = 0 = Inactive

    @Column(name = "created_by", columnDefinition = "NVARCHAR(50)")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by", columnDefinition = "NVARCHAR(50)")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
