package com.autonoma.erp.dto;

import lombok.Data;
import java.util.Date;

@Data
public class NcrOfiDto {
    private Long id;
    private String ncrNo;
    private String observationNo;
    private Date observationDate;
    private Date createdDate;
    private String auditType;
    private String auditScheduleNo;
    private String departmentName;
    private String auditee;
    private String auditor;
    private String ncrApprovedBy;
    private String criteriaDetails;
    private String clause;
    private Integer observationId;
    private String observationStatus;
    private String attachmentReq;
    private String seqNo;
    private String rootCause;
    private String correctiveAction;
    private String preventiveAction;
    private Date targetDate;
    private String ncrStatus;
    private String approvalStatus;
    private String remarks;
}
