package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "QMS_MEETING_USER_ATTENDANCE",
       uniqueConstraints = @UniqueConstraint(columnNames = {"SCHEDULE_ID", "EMPLOYEE_ID"}))
@Data
@NoArgsConstructor
public class QmsMeetingUserAttendance extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "SCHEDULE_ID", nullable = false)
    private QmsMeetingSchedule schedule;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EMPLOYEE_ID", nullable = false)
    private EmployeeMaster employee;

    @Column(name = "IN_TIME")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime inTime;

    @Column(name = "OUT_TIME")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime outTime;

    @Column(name = "STATUS")
    private String status = "PRESENT"; // PRESENT, LATE, ABSENT

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
