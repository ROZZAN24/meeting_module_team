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
    private Date createdDate;

    @Column(name = "UPDATED_USER", length = 100)
    private String updatedUser;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    // Explicit Getters and Setters
    public String getCreatedUser() { return createdUser; }
    public void setCreatedUser(String createdUser) { this.createdUser = createdUser; }

    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }

    public String getUpdatedUser() { return updatedUser; }
    public void setUpdatedUser(String updatedUser) { this.updatedUser = updatedUser; }

    public Date getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(Date updatedDate) { this.updatedDate = updatedDate; }

    // Backward compatibility aliases
    @com.fasterxml.jackson.annotation.JsonProperty("createdBy")
    public String getCreatedBy() { return getCreatedUser(); }
    public void setCreatedBy(String createdBy) { setCreatedUser(createdBy); }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedBy")
    public String getUpdatedBy() { return getUpdatedUser(); }
    public void setUpdatedBy(String updatedBy) { setUpdatedUser(updatedBy); }

    @com.fasterxml.jackson.annotation.JsonProperty("createdAt")
    public Date getCreatedAt() { return getCreatedDate(); }
    public void setCreatedAt(Date createdAt) { setCreatedDate(createdAt); }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        if (createdAt != null) {
            setCreatedDate(java.sql.Timestamp.valueOf(createdAt));
        } else {
            setCreatedDate(null);
        }
    }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedAt")
    public Date getUpdatedAt() { return getUpdatedDate(); }
    public void setUpdatedAt(Date updatedAt) { setUpdatedDate(updatedAt); }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) {
        if (updatedAt != null) {
            setUpdatedDate(java.sql.Timestamp.valueOf(updatedAt));
        } else {
            setUpdatedDate(null);
        }
    }


    @Transient
    private boolean skipAuditUpdate = false;

    @Transient
    private transient boolean isNew = true;

    public boolean isSkipAuditUpdate() { return skipAuditUpdate; }
    public void setSkipAuditUpdate(boolean skipAuditUpdate) { this.skipAuditUpdate = skipAuditUpdate; }

    @PostLoad
    protected void onPostLoad() {
        this.isNew = false;
    }

    @PrePersist
    protected void onCreate() {
        this.isNew = true;
        if (this.createdDate == null) {
            this.createdDate = new Date();
        }
        if (this.createdUser == null) {
            this.createdUser = SecurityUtils.getCurrentUserDisplayName();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.isNew) {
            return;
        }
        if (this.skipAuditUpdate) {
            return;
        }
        this.updatedDate = new Date();
        
        if (this.updatedUser == null || this.updatedUser.trim().isEmpty()) {
            String empName = null;
            try {
                empName = com.autonoma.erp.util.SecurityUtils.getCurrentUserEmployeeName();
            } catch (Exception e) {
            }
            
            if (empName != null && !empName.trim().isEmpty()) {
                this.updatedUser = empName;
            } else {
                this.updatedUser = "Admin";
            }
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public boolean isNewEntity() {
        return this.isNew;
    }
}
