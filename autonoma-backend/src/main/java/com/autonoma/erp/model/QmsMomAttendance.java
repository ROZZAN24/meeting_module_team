package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "QMS_MOM_ATTENDANCE")
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class QmsMomAttendance extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MOM_ID", nullable = false)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private QmsMomMaster mom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EMPLOYEE_ID", nullable = false)
    private EmployeeMaster employee;

    @Column(name = "IN_TIME")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime inTime;

    @Column(name = "OUT_TIME")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime outTime;

    @Column(name = "ATTENDANCE_STATUS")
    private String attendanceStatus; // Present / Absent

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
