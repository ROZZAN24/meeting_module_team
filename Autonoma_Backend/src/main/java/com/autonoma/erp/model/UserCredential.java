package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "USER_CREDENTIALS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCredential {
    @Id
    @Column(name = "USER_ID", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Column(name = "EMP_ID", nullable = false)
    private Integer empId;

    @Column(name = "PASSWORD", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String password;

    @Column(name = "CREATED_BY", columnDefinition = "NVARCHAR(50)")
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", columnDefinition = "NVARCHAR(50)")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "IMG_NAME", columnDefinition = "NVARCHAR(255)")
    private String imgName;
}
