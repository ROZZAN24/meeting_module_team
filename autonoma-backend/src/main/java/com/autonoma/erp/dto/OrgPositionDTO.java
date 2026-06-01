package com.autonoma.erp.dto;

import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
public class OrgPositionDTO {
    private Long id;
    private String positionTitle;
    private Long departmentId;
    private Long parentPositionId;
    private Long assignedEmployeeId;
    private String status;

    // Joined Employee Details
    private String firstName;
    private String lastName;
    private String employeeName;
    private String empCode;
    private String designationId;
    private String departmentName;
    private String photo;

    private List<OrgPositionDTO> children = new ArrayList<>();
}
