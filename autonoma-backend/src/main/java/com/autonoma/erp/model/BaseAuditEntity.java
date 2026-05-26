package com.autonoma.erp.model;

import jakarta.persistence.*;
import java.util.Date;
import com.autonoma.erp.util.SecurityUtils;

@MappedSuperclass
public abstract class BaseAuditEntity {

    @Column(name = "CREATED_USER", length = 100)
    private String createdUser;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "UPDATED_USER", length = 100)
    private String updatedUser;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // Explicit Getters and Setters
    public String getCreatedUser() { return createdUser; }
    public void setCreatedUser(String createdUser) { this.createdUser = createdUser; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public String getUpdatedUser() { return updatedUser; }
    public void setUpdatedUser(String updatedUser) { this.updatedUser = updatedUser; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    // Backward compatibility aliases
    public String getCreatedBy() { return getCreatedUser(); }
    public void setCreatedBy(String createdBy) { setCreatedUser(createdBy); }

    public String getUpdatedBy() { return getUpdatedUser(); }
    public void setUpdatedBy(String updatedBy) { setUpdatedUser(updatedBy); }

    public Date getCreatedDate() { return getCreatedAt(); }
    public void setCreatedDate(Date createdDate) { setCreatedAt(createdDate); }

    public Date getUpdatedDate() { return getUpdatedAt(); }
    public void setUpdatedDate(Date updatedDate) { setUpdatedAt(updatedDate); }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
        if (this.createdUser == null) {
            this.createdUser = SecurityUtils.getCurrentUserId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
        this.updatedUser = SecurityUtils.getCurrentUserId();
    }
}
