package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMAIL_CONTENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailContent extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TYPE", length = 100, nullable = false)
    private String type;

    @Column(name = "SUBJECT", length = 500, nullable = false)
    private String subject;

    @Column(name = "BODY_CONTENT", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String bodyContent;

    @Column(name = "YOURS_WINDFULLY", length = 200, nullable = false)
    private String yoursWindfully;

    @Column(name = "STATUS")
    private String status; // ACTIVE, INACTIVE

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    // Explicit getter/setter for isActive
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
