package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "bos_user_page_auth")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(BosUserPageAuthId.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BosUserPageAuth {

    @Id
    @Column(name = "user_id", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Id
    @Column(name = "page_id")
    private Integer pageId;

    @Column(name = "sub_mod_id")
    private Integer subModId;

    @Column(name = "mod_id", nullable = false)
    private Integer modId;

    @Column(name = "enable")
    private Integer enable;

    @Column(name = "read_acs")
    private Integer readAcs;

    @Column(name = "write")
    private Integer write;

    @Column(name = "delete_acs")
    private Integer deleteAcs;

    @Column(name = "export")
    private Integer export;

    @Column(name = "approval")
    private Integer approval;

    @Column(name = "manager")
    private Integer manager;

    @Column(name = "additional1")
    private Integer additional1;

    @Column(name = "additional2")
    private Integer additional2;

    @Column(name = "created_by", columnDefinition = "NVARCHAR(50)")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdDate;

    @Column(name = "updated_by", columnDefinition = "NVARCHAR(50)")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new java.util.Date();
        if (createdBy == null) {
            createdBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new java.util.Date();
        updatedBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserCredential user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", insertable = false, updatable = false)
    private BosPage page;

    @Transient
    private boolean enableFlag = false;
    @Transient
    private boolean readAcsFlag = false;
    @Transient
    private boolean writeFlag = false;
    @Transient
    private boolean deleteAcsFlag = false;
    @Transient
    private boolean exportFlag = false;
    @Transient
    private boolean approvalFlag = false;
    @Transient
    private boolean managerFlag = false;
    @Transient
    private boolean additional1Flag = false;
    @Transient
    private boolean additional2Flag = false;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getPageId() {
        return pageId;
    }

    public void setPageId(Integer pageId) {
        this.pageId = pageId;
    }

    public Integer getSubModId() {
        return subModId;
    }

    public void setSubModId(Integer subModId) {
        this.subModId = subModId;
    }

    public Integer getModId() {
        return modId;
    }

    public void setModId(Integer modId) {
        this.modId = modId;
    }

    public Integer getEnable() {
        return enable;
    }

    public void setEnable(Integer enable) {
        this.enable = enable;
    }

    public Integer getReadAcs() {
        return readAcs;
    }

    public void setReadAcs(Integer readAcs) {
        this.readAcs = readAcs;
    }

    public Integer getWrite() {
        return write;
    }

    public void setWrite(Integer write) {
        this.write = write;
    }

    public Integer getDeleteAcs() {
        return deleteAcs;
    }

    public void setDeleteAcs(Integer deleteAcs) {
        this.deleteAcs = deleteAcs;
    }

    public Integer getExport() {
        return export;
    }

    public void setExport(Integer export) {
        this.export = export;
    }

    public Integer getApproval() {
        return approval;
    }

    public void setApproval(Integer approval) {
        this.approval = approval;
    }

    public Integer getManager() {
        return manager;
    }

    public void setManager(Integer manager) {
        this.manager = manager;
    }

    public Integer getAdditional1() {
        return additional1;
    }

    public void setAdditional1(Integer additional1) {
        this.additional1 = additional1;
    }

    public Integer getAdditional2() {
        return additional2;
    }

    public void setAdditional2(Integer additional2) {
        this.additional2 = additional2;
    }

    public UserCredential getUser() {
        return user;
    }

    public void setUser(UserCredential user) {
        this.user = user;
    }

    public BosPage getPage() {
        return page;
    }

    public void setPage(BosPage page) {
        this.page = page;
    }
}

class BosUserPageAuthId implements Serializable {
    private String userId;
    private Integer pageId;

    public BosUserPageAuthId() {
    }

    public BosUserPageAuthId(String userId, Integer pageId) {
        this.userId = userId;
        this.pageId = pageId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        BosUserPageAuthId that = (BosUserPageAuthId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(pageId, that.pageId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, pageId);
    }
}
