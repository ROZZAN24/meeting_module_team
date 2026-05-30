package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "QMS_MOM")
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class QmsMomMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "MOM_NO", nullable = false, unique = true)
    private String momNo;

    @Column(name = "MOM_DATE", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate momDate = LocalDate.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "SCHEDULE_ID", nullable = false)
    private QmsMeetingSchedule schedule;

    @Column(name = "AGENDA", columnDefinition = "NVARCHAR(MAX)")
    private String agenda;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CHAIRED_BY_ID")
    private EmployeeMaster chairedBy;

    @Column(name = "START_TIME")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @Column(name = "END_TIME")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @Column(name = "STATUS")
    private String status = "OPEN";

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "mom", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("mom")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<QmsMomAttendance> attendanceList;

    @OneToMany(mappedBy = "mom", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("mom")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<QmsMomDetail> details;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
