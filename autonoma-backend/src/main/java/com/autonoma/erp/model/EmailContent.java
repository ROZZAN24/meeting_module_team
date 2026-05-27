package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "IND_EMAIL_CONTENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailContent extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type", length = 100, nullable = false)
    private String type;

    @Column(name = "subject", length = 500, nullable = false)
    private String subject;

    @Column(name = "body_content", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String bodyContent;

    @Column(name = "yours_windfully", length = 200, nullable = false)
    private String yoursWindfully;

    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE
}
