package com.autonoma.erp.model.admin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "AD_USER_CREDENTIAL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class UserCredential {
    @Id
    @Column(name = "USER_ID", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Column(name = "EMP_ID", nullable = false)
    private Long empId;

    @Column(name = "PASSWORD", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String password;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "IMG_NAME", columnDefinition = "NVARCHAR(255)")
    private String imgName;

    @Column(name = "IS_BOS_ADMIN")
    private Integer isBosAdmin;

    @Column(name = "FACE_IMAGE", columnDefinition = "NVARCHAR(MAX)")
    private String faceImage;

    @Column(name = "AUTH_METHOD", columnDefinition = "NVARCHAR(50)")
    private String authMethod = "PASSWORD";

    @Column(name = "FACE_DESCRIPTOR", columnDefinition = "NVARCHAR(MAX)")
    private String faceDescriptor;

    @Column(name = "AUTO_LOGOUT_ON_FACE_ABSENCE")
    private Integer autoLogoutOnFaceAbsence = 0;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdDate = new Date();
        if (createdBy == null || createdBy.isEmpty()) createdBy = "Admin";
        if (isActive == null) isActive = true;
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        updatedDate = new Date();
        if (updatedBy == null || updatedBy.isEmpty()) updatedBy = "Admin";
        }

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

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Date getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(Date updatedDate) {
        this.updatedDate = updatedDate;
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

    public String getFaceImage() {
        return faceImage;
    }

    public void setFaceImage(String faceImage) {
        this.faceImage = faceImage;
    }

    public String getAuthMethod() {
        return authMethod;
    }

    public void setAuthMethod(String authMethod) {
        this.authMethod = authMethod;
    }

    public String getFaceDescriptor() {
        return faceDescriptor;
    }

    public void setFaceDescriptor(String faceDescriptor) {
        this.faceDescriptor = faceDescriptor;
    }

    public Integer getAutoLogoutOnFaceAbsence() {
        return autoLogoutOnFaceAbsence;
    }

    public void setAutoLogoutOnFaceAbsence(Integer autoLogoutOnFaceAbsence) {
        this.autoLogoutOnFaceAbsence = autoLogoutOnFaceAbsence;
    }
}
