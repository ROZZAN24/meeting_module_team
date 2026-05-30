package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "QMS_AUDIT_ATTENDANCE")
@Data
public class AuditAttendance extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "AUDIT_SCHEDULE_NO", columnDefinition = "NVARCHAR(50)")
    private String auditScheduleNo;

    @Column(name = "NAME", columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(name = "EMPLOYEE_CODE", columnDefinition = "NVARCHAR(50)")
    private String employeeCode;

    @Column(name = "IN_TIME", columnDefinition = "NVARCHAR(50)")
    private String inTime;

    @Column(name = "OUT_TIME", columnDefinition = "NVARCHAR(50)")
    private String outTime;

    @Column(name = "ATTENDANCE_STATUS", columnDefinition = "NVARCHAR(50)")
    private String attendanceStatus;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
