package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import com.autonoma.erp.model.admin.BosPage;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "FILE_TRACEABILITY_MANAGEMENT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileTraceabilityManagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Integer rowId;

    @Column(name = "page_id")
    private Integer pageId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "page_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"module", "subModule", "hibernateLazyInitializer", "handler"})
    private BosPage page;

    @Column(name = "page_name", length = 200)
    private String pageName;

    @Column(name = "report_name", length = 200)
    private String reportName;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Transient
    private String creatorName;

    @Transient
    private String creatorImg;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdAt = new Date();
        if (createdBy == null || createdBy.trim().isEmpty()) {
            createdBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
            if (createdBy == null || createdBy.trim().isEmpty()) {
                createdBy = "System";
            }
        }
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        updatedAt = new Date();
        
        if (updatedBy == null) {
            updatedBy = "System";
        }
        }
}
