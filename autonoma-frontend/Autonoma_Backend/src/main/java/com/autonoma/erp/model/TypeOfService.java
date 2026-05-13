package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "SM_TYPE_OF_SERVICE")
@Data
public class TypeOfService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SERVICE_CODE", length = 50)
    private String serviceCode;

    @Column(name = "SERVICE_NAME", length = 100)
    private String serviceName;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "STATUS", length = 20)
    private String status;
}
