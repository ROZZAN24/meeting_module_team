package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "QMS_UOM")
@Getter
@Setter
public class QmsUom extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "UOM_CODE", nullable = false, unique = true, length = 50)
    private String uomCode; // e.g. KW, MW

    @Column(name = "UOM_DESCRIPTION", length = 255)
    private String uomDescription;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
