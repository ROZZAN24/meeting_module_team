package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
<<<<<<< HEAD
@Table(name = "sm_type_of_service")
=======
@Table(name = "SM_TYPE_OF_SERVICE")
>>>>>>> origin/chore/repo-cleanup
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

<<<<<<< HEAD
    @Column(name = "STATUS")
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
=======
    @Column(name = "STATUS", length = 20)
    private String status;
>>>>>>> origin/chore/repo-cleanup
}
