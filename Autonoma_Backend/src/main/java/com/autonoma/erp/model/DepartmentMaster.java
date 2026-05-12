package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "HR_DEPARTMENT_MASTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "DEPT_NO", unique = true, nullable = false)
    private Integer deptNo;

    @Column(name = "DEPT_NAME", length = 50, nullable = false)
    private String deptName;

    @Column(name = "NDA_CERTIFICATE", length = 3)
    private String ndaCertificate = "No";

    @Column(name = "SEQ_NO")
    private Integer seqNo = 0;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedDate;

    @Column(name = "STATUS", length = 10)
    private String status = "Active";

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
        if (ndaCertificate == null) {
            ndaCertificate = "No";
        }
        if (seqNo == null) {
            seqNo = 0;
        }
        if (status == null) {
            status = "Active";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
