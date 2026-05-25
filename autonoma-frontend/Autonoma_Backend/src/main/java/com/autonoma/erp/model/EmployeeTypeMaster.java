package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "hrm_employee_type_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeTypeMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_name", unique = true, nullable = false)
    private String typeName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    public EmployeeTypeMaster(String name) {
        this.typeName = name;
        this.status = "ACTIVE";
    }
}
