package com.autonoma.erp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "ad_user_credential")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserCredential {
    @Id
    @Column(name = "user_id", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Column(name = "emp_id", nullable = false)
    private Long empId;

    @Column(name = "password", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String password;

    @Column(name = "created_by", columnDefinition = "NVARCHAR(50)")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by", columnDefinition = "NVARCHAR(50)")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @Column(name = "status")
    private Integer status;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        if (createdBy == null) {
            createdBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
        updatedBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
    }

    @Column(name = "img_name", columnDefinition = "NVARCHAR(255)")
    private String imgName;

    @Column(name = "IS_BOS_ADMIN")
    private Integer isBosAdmin;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Long getEmpId() {
        return empId;
    }

    public void setEmpId(Long empId) {
        this.empId = empId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getImgName() {
        return imgName;
    }

    public void setImgName(String imgName) {
        this.imgName = imgName;
    }

    public Integer getIsBosAdmin() {
        return isBosAdmin;
    }

    public void setIsBosAdmin(Integer isBosAdmin) {
        this.isBosAdmin = isBosAdmin;
    }
}
