package com.autonoma.erp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "QMS_MEETING_SCHEDULE")
@Data
@NoArgsConstructor
public class QmsMeetingSchedule extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_no", nullable = false, unique = true)
    private String scheduleNo;

    @Column(name = "rev_source_schedule_no")
    private String revSourceScheduleNo;

    @Column(name = "rev_no")
    private Integer revNo = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "meeting_type_id", nullable = false)
    private QmsMeetingMaster meetingType;

    @Column(name = "meeting_name")
    private String meetingName;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "agenda", columnDefinition = "NVARCHAR(MAX)")
    private String agenda;

    @Column(name = "subject", columnDefinition = "NVARCHAR(MAX)")
    private String subject;

    @Column(name = "customer_code")
    private String customerCode;

    @Column(name = "supplier_code")
    private String supplierCode;

    @NotNull(message = "Schedule Date is required")
    @Column(name = "meeting_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate meetingDate;

    @NotNull(message = "Schedule Time is required")
    @Column(name = "start_time", nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @Column(name = "interval_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime intervalTime;

    @NotBlank(message = "frequency is required")
    @Column(name = "frequency")
    private String frequency = "NONE";

    @Column(name = "weekdays")
    private String weekdays;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chaired_by_id")
    private EmployeeMaster chairedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "host_by_id")
    private EmployeeMaster hostBy;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "reschedule_reason")
    private String rescheduleReason;

    @Column(name = "comments", columnDefinition = "NVARCHAR(MAX)")
    private String comments;

    @Column(name = "status")
    private String status = "OPEN";







    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("schedule")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<QmsMeetingScheduleDepartment> departments;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("schedule")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<QmsMeetingScheduleParticipant> participants;
}
