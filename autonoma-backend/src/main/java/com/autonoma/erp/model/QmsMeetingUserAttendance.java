package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "qms_meeting_user_attendance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"schedule_id", "employee_id"}))
@Data
@NoArgsConstructor
public class QmsMeetingUserAttendance extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "schedule_id", nullable = false)
    private QmsMeetingSchedule schedule;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private EmployeeMaster employee;

    @Column(name = "in_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime inTime;

    @Column(name = "out_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime outTime;

    @Column(name = "status")
    private String status = "PRESENT"; // PRESENT, LATE, ABSENT




}
