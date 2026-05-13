package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "ad_user_session_activity")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "USER_ID", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Column(name = "PAGE_NAME", columnDefinition = "NVARCHAR(100)")
    private String pageName;

    @Column(name = "PAGE_URL", columnDefinition = "NVARCHAR(255)")
    private String pageUrl;

    @Column(name = "ENTRY_TIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date entryTime;

    @Column(name = "EXIT_TIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date exitTime;

    @Column(name = "DURATION_MS")
    private Long durationMs;

    @Column(name = "IS_IDLE")
    private Boolean isIdle = false;

    @Column(name = "IDLE_TIME_MS")
    private Long idleTimeMs = 0L;

    @Transient
    private String userImage;
}
