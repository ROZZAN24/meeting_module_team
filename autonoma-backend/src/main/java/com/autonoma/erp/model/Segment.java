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

    @Column(name = "STATUS")
    private String status = "Active";
}
