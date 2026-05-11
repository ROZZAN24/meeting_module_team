package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hrm_level_master")
@Data
@NoArgsConstructor
public class LevelMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "level_name", unique = true, nullable = false)
    private String levelName;

    public LevelMaster(String name) { this.levelName = name; }
}
