package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "sm_currency")
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

    @Column(name = "STATUS", length = 20)
    private String status;
}
