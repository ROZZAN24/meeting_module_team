package com.autonoma.erp.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "audit_areas")
public class AuditArea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String type; // AREA or ZONE
    
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;
    
    @Column(columnDefinition = "NVARCHAR(50)")
    private String status;

    private String createdBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();
    
    private String updatedBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    // Explicit Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public Date getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(Date updatedDate) { this.updatedDate = updatedDate; }

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
