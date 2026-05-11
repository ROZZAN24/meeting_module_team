package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDateTime;

@Entity
@Table(name = "hrm_designation_master")
@Data
public class Designation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Nationalized
    @Column(name = "designation_code", length = 50)
    private String designationCode;

    @Nationalized
    @Column(name = "designation_name")
    private String designationName;

    @Nationalized
    @Column(name = "sub_category_level")
    private String subCategoryLevel;

    @Nationalized
    @Column(name = "experience")
    private String experience;

    @Nationalized
    @Column(name = "appear_in_competency", length = 10)
    private String appearInCompetency;

    @Column(name = "display_sl_no")
    private Integer displaySlNo;

    @Nationalized
    @Column(name = "qualification")
    private String qualification;

    @Nationalized
    @Column(name = "job_description", columnDefinition = "NVARCHAR(MAX)")
    private String jobDescription;

    @Column(name = "org_seq_no")
    private Integer orgSeqNo;

    @Column(name = "budgeted_positions")
    private Integer budgetedPositions;

    @Nationalized
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdDate;

    @Nationalized
    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
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
