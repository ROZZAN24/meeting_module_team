package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "qms_mom_detail")
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class QmsMomDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mom_id", nullable = false)
    private QmsMomMaster mom;

    @Column(name = "discussed_point", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String discussedPoint;

    @JsonProperty("type")
    @Column(name = "point_type")
    private String pointType;

    @Column(name = "material_list", columnDefinition = "NVARCHAR(MAX)")
    private String materialList;

    @Column(name = "process_type")
    private String processType; // INFO / ACTION

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by_id")
    private EmployeeMaster assignedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_id")
    private EmployeeMaster assignedTo;

    @Column(name = "target_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate targetDate;

    @Column(name = "review_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reviewDate;

    @Column(name = "attachment_required")
    private String attachmentRequired = "NO";

    @Column(name = "status")
    private String status = "OPEN";

    @Column(name = "action_taken", columnDefinition = "NVARCHAR(MAX)")
    private String actionTaken;

    @Column(name = "action_observation", columnDefinition = "NVARCHAR(MAX)")
    private String actionObservation;

    @Column(name = "cancel_remarks", columnDefinition = "NVARCHAR(MAX)")
    private String cancelRemarks;

    @Column(name = "rev_no")
    private Integer revNo = 0;

    @Column(name = "amendment_comments", columnDefinition = "NVARCHAR(MAX)")
    private String amendmentComments;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;
}
