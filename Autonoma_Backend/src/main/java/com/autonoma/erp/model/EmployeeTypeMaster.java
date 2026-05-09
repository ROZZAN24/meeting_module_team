package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "HRM_TYPE_MASTER")
@Data
@NoArgsConstructor
public class EmployeeTypeMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_name", unique = true, nullable = false)
    private String typeName;

    public EmployeeTypeMaster(String name) { this.typeName = name; }
}
