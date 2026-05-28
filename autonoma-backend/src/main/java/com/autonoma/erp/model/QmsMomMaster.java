package com.autonoma.erp.model;

import jakarta.persistence.*;
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
@Table(name = "QMS_MOM_MASTER")
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class QmsMomMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mom_no", nullable = false, unique = true)
    private String momNo;

    @Column(name = "mom_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate momDate = LocalDate.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "schedule_id", nullable = false)
    private QmsMeetingSchedule schedule;

    @Column(name = "agenda", columnDefinition = "NVARCHAR(MAX)")
    private String agenda;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chaired_by_id")
    private EmployeeMaster chairedBy;

    @Column(name = "start_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @Column(name = "end_time")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @Column(name = "status")
    private String status = "OPEN";





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
}
