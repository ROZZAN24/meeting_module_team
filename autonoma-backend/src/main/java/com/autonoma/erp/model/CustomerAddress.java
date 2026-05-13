package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "sm_customer_address")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "customer_name", length = 200)
    private String customerName;

    @Column(name = "invoice_name", length = 200)
    private String invoiceName;

    @Column(name = "shipment", length = 100)
    private String shipment;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "distance")
    private Double distance;

    @Column(name = "contact_name", length = 200)
    private String contactName;

    @Column(name = "contact_no", length = 50)
    private String contactNo;

    @Column(name = "status")
    @Builder.Default
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_date")
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
