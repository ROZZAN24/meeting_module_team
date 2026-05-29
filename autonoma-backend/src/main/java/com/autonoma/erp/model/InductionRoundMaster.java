package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "hr_induction_round_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InductionRoundMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "round_name", unique = true, nullable = false, length = 100)
    private String roundName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "status", length = 20)
    private String status; // ACTIVE, IN ACTIVE

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
}
