package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Table(name = "QMS_AUDIT_ATTENDANCE")
@Data
public class AuditAttendance extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "audit_schedule_no", columnDefinition = "NVARCHAR(50)")
    private String auditScheduleNo;

    @Column(name = "name", columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(name = "employee_code", columnDefinition = "NVARCHAR(50)")
    private String employeeCode;

    @Column(name = "in_time", columnDefinition = "NVARCHAR(50)")
    private String inTime;

    @Column(name = "out_time", columnDefinition = "NVARCHAR(50)")
    private String outTime;

    @Column(name = "attendance_status", columnDefinition = "NVARCHAR(50)")
    private String attendanceStatus;
}
