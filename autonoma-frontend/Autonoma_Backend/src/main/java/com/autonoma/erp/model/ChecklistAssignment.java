package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;
import com.autonoma.erp.util.StringListConverter;

@Entity
@Table(name = "qms_checklist_assignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private MasterChecklist checklist;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "assigned_by")
    private String assignedBy;

    @Column(name = "assign_type", length = 50)
    private String assignType;

    @Column(name = "assigned_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date assignedDate;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private StatusMaster status;

    @Column(name = "remarks", columnDefinition = "NVARCHAR(MAX)")
    private String remarks;

    @Column(name = "checklist_date")
    @Temporal(TemporalType.DATE)
    private Date checklistDate;

    @Column(name = "carry_forward")
    private String carryForward;

    @Convert(converter = StringListConverter.class)
    @Column(name = "actual_files", columnDefinition = "NVARCHAR(MAX)")
    private List<String> actualFiles;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<ChecklistVerification> verifications;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public MasterChecklist getChecklist() { return checklist; }
    public void setChecklist(MasterChecklist checklist) { this.checklist = checklist; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }
    public String getAssignType() { return assignType; }
    public void setAssignType(String assignType) { this.assignType = assignType; }
    public Date getAssignedDate() { return assignedDate; }
    public void setAssignedDate(Date assignedDate) { this.assignedDate = assignedDate; }
    public StatusMaster getStatus() { return status; }
    public void setStatus(StatusMaster status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Date getChecklistDate() { return checklistDate; }
    public void setChecklistDate(Date checklistDate) { this.checklistDate = checklistDate; }
    public String getCarryForward() { return carryForward; }
    public void setCarryForward(String carryForward) { this.carryForward = carryForward; }
    public List<String> getActualFiles() { return actualFiles; }
    public void setActualFiles(List<String> actualFiles) { this.actualFiles = actualFiles; }
}
