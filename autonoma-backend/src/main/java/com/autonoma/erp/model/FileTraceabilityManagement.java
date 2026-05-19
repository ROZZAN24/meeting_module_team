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
@Table(name = "file_traceability_management")
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

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
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
        updatedAt = new Date();
        updatedBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        if (updatedBy == null) {
            updatedBy = "System";
        }
    }
}
