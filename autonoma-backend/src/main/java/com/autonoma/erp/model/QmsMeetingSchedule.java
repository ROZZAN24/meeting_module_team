package com.autonoma.erp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
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

    @Column(name = "SCHEDULE_NO", nullable = false, unique = true)
    private String scheduleNo;

    @Column(name = "REV_SOURCE_SCHEDULE_NO")
    private String revSourceScheduleNo;

    @Column(name = "REV_NO")
    private Integer revNo = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MEETING_TYPE_ID", nullable = false)
    private QmsMeetingMaster meetingType;

    @Column(name = "MEETING_NAME")
    private String meetingName;

    @Column(name = "DESCRIPTION", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "AGENDA", columnDefinition = "NVARCHAR(MAX)")
    private String agenda;

    @Column(name = "SUBJECT", columnDefinition = "NVARCHAR(MAX)")
    private String subject;

    @Column(name = "CUSTOMER_CODE")
    private String customerCode;

    @Column(name = "SUPPLIER_CODE")
    private String supplierCode;

    @NotNull(message = "Schedule Date is required")
    @Column(name = "MEETING_DATE", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate meetingDate;

    @NotNull(message = "Schedule Time is required")
    @Column(name = "START_TIME", nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @Column(name = "END_TIME", nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @Column(name = "INTERVAL_TIME")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime intervalTime;

    @NotBlank(message = "frequency is required")
    @Column(name = "FREQUENCY")
    private String frequency = "NONE";

    @Column(name = "WEEKDAYS")
    private String weekdays;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CHAIRED_BY_ID")
    private EmployeeMaster chairedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "HOST_BY_ID")
    private EmployeeMaster hostBy;

    @Column(name = "CANCEL_REASON")
    private String cancelReason;

    @Column(name = "RESCHEDULE_REASON")
    private String rescheduleReason;

    @Column(name = "COMMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String comments;

    @Column(name = "STATUS")
    private String status = "OPEN";

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
