package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "HRM_CATEGORY_MASTER")
@Data
@NoArgsConstructor
public class CategoryMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_name", unique = true, nullable = false)
    private String categoryName;

    public CategoryMaster(String name) { this.categoryName = name; }
}
