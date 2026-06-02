package com.autonoma.erp.model.chat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "COMM_CHANNEL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommChannel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_name")
    private String channelName;

    @Column(name = "channel_type", nullable = false)
    private String channelType; // DIRECT, DEPARTMENT, PROJECT, TEAM, WORKFLOW, TASK

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt = new Date();
}
