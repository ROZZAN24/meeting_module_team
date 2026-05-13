package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDateTime;

@Entity
@Table(name = "DesignationMaster")
@Data
public class Designation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Nationalized
    @Column(length = 50)
    private String designationCode;

    @Nationalized
    private String designationName;

    @Nationalized
    private String subCategoryLevel;

    @Nationalized
    private String experience;

    @Nationalized
    @Column(length = 10)
    private String appearInCompetency;

    private Integer displaySlNo;

    @Nationalized
    private String qualification;

    @Nationalized
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String jobDescription;

    private Integer orgSeqNo;

    private Integer budgetedPositions;

    @Nationalized
    private String createdBy;

    private LocalDateTime createdDate;

    @Nationalized
    private String updatedBy;

    private LocalDateTime updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}
