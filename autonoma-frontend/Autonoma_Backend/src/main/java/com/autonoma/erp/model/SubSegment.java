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

    @Column(name = "SUB_SEGMENT_CODE")
    private String subSegmentCode;

    @Column(name = "SUB_SEGMENT_NAME")
    private String subSegmentName;

    @Column(name = "STATUS")
    private String status = "Active";

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
