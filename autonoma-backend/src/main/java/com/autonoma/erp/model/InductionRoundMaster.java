package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import com.autonoma.erp.util.SecurityUtils;

@Entity
@Table(name = "HR_INDUCTION_ROUND")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InductionRoundMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ROUND_NAME", unique = true, nullable = false, length = 100)
    private String roundName;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "STATUS", length = 20)
    private String status; // ACTIVE, IN ACTIVE

    @Column(name = "DISPLAY_ORDER")
    private Integer displayOrder;

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

    // Explicit getter/setter for isActive
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // Backward-compatible alias methods for audit fields
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

    @PrePersist
    protected void onCreate() {
        if (this.createdDate == null) {
            this.createdDate = new Date();
        }
        if (this.createdBy == null) {
            this.createdBy = SecurityUtils.getCurrentUserId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedDate = new Date();
        this.updatedBy = SecurityUtils.getCurrentUserId();
    }
}
