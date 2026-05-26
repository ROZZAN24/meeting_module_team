package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "QMS_UOM")
@Getter
@Setter
public class QmsUom extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uom_code", nullable = false, unique = true, length = 50)
    private String uomCode; // e.g. KW, MW

    @Column(name = "uom_description", length = 255)
    private String uomDescription;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

}
