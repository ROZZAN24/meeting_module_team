package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "sm_sub_segment")
public class SubSegment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SEGMENT_NAME")
    private String segmentName;

    @Column(name = "SUB_SEGMENT_CODE")
    private String subSegmentCode;

    @Column(name = "SUB_SEGMENT_NAME")
    private String subSegmentName;

    @Column(name = "SUB_SEGMENT_DESCRIPTION")
    private String subSegmentDescription;

    @Column(name = "STATUS")
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private java.util.Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private java.util.Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new java.util.Date();
        if (createdBy == null) {
            createdBy = "Admin";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new java.util.Date();
        if (updatedBy == null) {
            updatedBy = "Admin";
        }
    }
}
