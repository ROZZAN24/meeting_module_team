package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "NPD_PROCESS")
@Getter
@Setter
public class ProductProcess extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "PROCESS_NAME", nullable = false, unique = true, length = 150)
    private String processName;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Override
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }
}
