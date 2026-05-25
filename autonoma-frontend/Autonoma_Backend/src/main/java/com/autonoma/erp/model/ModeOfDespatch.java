package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "mode_of_despatch")
@Data
public class ModeOfDespatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mode_name", length = 100, nullable = false)
    private String modeName;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "status", length = 50, nullable = false)
    private String status = "Active";

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_by", length = 255)
    private String updatedBy;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
}
