package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;
import com.autonoma.erp.util.StringListConverter;

@Entity
@Table(name = "QMS_CHECKLIST_ASSIGNMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CHECKLIST_ID")
    private MasterChecklist checklist;

    @Column(name = "ASSIGNED_TO")
    private String assignedTo;

    @Column(name = "ASSIGNED_BY")
    private String assignedBy;

    @Column(name = "ASSIGN_TYPE", length = 50)
    private String assignType;

    @Column(name = "ASSIGNED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date assignedDate;

    @ManyToOne
    @JoinColumn(name = "STATUS_ID")
    private StatusMaster status;

    @Column(name = "REMARKS", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "CHECKLIST_DATE")
    @Temporal(TemporalType.DATE)
    private Date checklistDate;

    @Column(name = "CARRY_FORWARD")
    private String carryForward;

    @Convert(converter = StringListConverter.class)
    @Column(name = "ACTUAL_FILES", columnDefinition = "NVARCHAR(MAX)")
    private List<String> actualFiles;

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
