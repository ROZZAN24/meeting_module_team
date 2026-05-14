package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MASTER_COUNTRY")
@Data
public class CountryMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "STATUS", length = 20)
    private String status;
}
