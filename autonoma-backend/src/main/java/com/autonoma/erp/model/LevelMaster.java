package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_LEVEL")
@Data
@NoArgsConstructor
public class LevelMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "LEVEL_NAME", unique = true, nullable = false, length = 100)
    private String levelName;

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

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public LevelMaster(String name) { this.levelName = name; }

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
        if (createdBy == null) {
            createdBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
        updatedBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
    }
}
