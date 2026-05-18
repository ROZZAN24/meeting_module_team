package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
<<<<<<< HEAD
@Table(name = "sm_currency")
=======
@Table(name = "SM_CURRENCY")
>>>>>>> origin/chore/repo-cleanup
@Data
public class Currency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CURRENCY_CODE", length = 10)
    private String currencyCode;

    @Column(name = "CURRENCY_NAME", length = 100)
    private String currencyName;

    @Column(name = "SYMBOL", length = 10)
    private String symbol;

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
