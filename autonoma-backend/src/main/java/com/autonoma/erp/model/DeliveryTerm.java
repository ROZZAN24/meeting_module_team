package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "sm_delivery_terms")
@Data
public class DeliveryTerm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TERM_CODE", length = 50)
    private String termCode;

    @Column(name = "TERM_NAME", length = 100)
    private String termName;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "STATUS", length = 20)
    private String status;
}
