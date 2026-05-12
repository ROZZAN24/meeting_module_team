package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "AD_USER_SESSION_AUDIT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "USER_ID", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Column(name = "IP_ADDRESS", columnDefinition = "NVARCHAR(50)")
    private String ipAddress;

    @Column(name = "LOGIN_TIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date loginTime;

    @Column(name = "LOGOUT_TIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date logoutTime;

    @Column(name = "USER_AGENT", columnDefinition = "NVARCHAR(255)")
    private String userAgent;

    @Column(name = "SESSION_STATUS", columnDefinition = "NVARCHAR(20)")
    private String status; // ACTIVE, COMPLETED, TIMEOUT

    @Transient
    private String userImage;
}
