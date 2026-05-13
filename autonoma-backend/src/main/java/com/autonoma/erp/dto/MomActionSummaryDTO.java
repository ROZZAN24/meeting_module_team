package com.autonoma.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MomActionSummaryDTO {
    private Long id;
    private Long momId;
    private String momNo;
    private LocalDate momDate;
    private String scheduleNo;
    private String meetNo;
    private String amendMeetNo;
    private String discussedPoint;
    private String pointType;
    private String materialList;
    private String processType;
    private String assignedBy;
    private String assignedTo;
    private LocalDate targetDate;
    private LocalDate reviewDate;
    private String attachmentRequired;
    private String status;
    private String actionTaken;
    private String actionObservation;
    private String cancelRemarks;
    private LocalDateTime createdAt;
    private String createdBy;
}
