package com.autonoma.erp.model.admin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "ad_migration_audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MigrationAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_name", length = 100)
    private String tableName;

    @Column(name = "migrated_by", length = 50)
    private String migratedBy;

    @Column(name = "migrated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date migratedAt;

    @Column(name = "status", length = 50)
    private String status; // SUCCESS, FAILED

    @Column(name = "records_count")
    private Integer recordsCount;

    @Column(name = "message", columnDefinition = "NVARCHAR(MAX)")
    private String message;

    @PrePersist
    protected void onCreate() {
        if (migratedAt == null) {
            migratedAt = new Date();
        }
    }
}
