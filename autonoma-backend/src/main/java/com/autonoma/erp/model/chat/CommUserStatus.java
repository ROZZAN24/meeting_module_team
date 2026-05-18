package com.autonoma.erp.model.chat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "COMM_USER_STATUS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommUserStatus {
    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "is_online")
    private Integer isOnline = 0;

    @Column(name = "last_seen")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastSeen = new Date();

    @Column(name = "is_typing_channel_id")
    private Long isTypingChannelId;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt = new Date();
}
