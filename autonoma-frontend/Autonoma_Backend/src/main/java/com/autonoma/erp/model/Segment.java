package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "sm_segment")
public class Segment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SEGMENT_CODE")
    private String segmentCode;

    @Column(name = "SEGMENT_NAME")
    private String segmentName;

    @Column(name = "segment_description", length = 1000)
    private String segmentDescription;

    @Column(name = "STATUS")
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
