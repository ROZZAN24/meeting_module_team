package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MASTER_STATE")
@Data
public class StateMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "COUNTRY_NAME", length = 100)
    private String countryName;

    @Column(name = "STATE_NAME", length = 100)
    private String stateName;

    @Column(name = "STATE_CODE", length = 20)
    private String stateCode;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
