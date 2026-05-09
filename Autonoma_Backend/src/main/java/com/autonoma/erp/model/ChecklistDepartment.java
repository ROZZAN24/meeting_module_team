package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "QMS_CHECKLIST_DEPARTMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistDepartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CHECKLIST_ID")
    @JsonIgnore
    private MasterChecklist checklist;

    @Column(name = "DEPARTMENT_NAME")
    private String departmentName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public MasterChecklist getChecklist() { return checklist; }
    public void setChecklist(MasterChecklist checklist) { this.checklist = checklist; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
}
