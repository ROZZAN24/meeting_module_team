package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "bos_user_sub_modules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(BosUserSubModuleId.class)
public class BosUserSubModule {

    @Id
    @Column(name = "user_id", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Id
    @Column(name = "sub_mod_id")
    private Integer subModId;

    @Column(name = "mod_id", nullable = false)
    private Integer modId;

    @Column(name = "enabled")
    private Integer enabled;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserCredential user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_mod_id", insertable = false, updatable = false)
    private BosSubModule subModule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mod_id", insertable = false, updatable = false)
    private BosModule module;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public Integer getEnabled() {
        return enabled;
    }

    public void setEnabled(Integer enabled) {
        this.enabled = enabled;
    }

    public UserCredential getUser() {
        return user;
    }

    public void setUser(UserCredential user) {
        this.user = user;
    }

    public BosSubModule getSubModule() {
        return subModule;
    }

    public void setSubModule(BosSubModule subModule) {
        this.subModule = subModule;
    }

    public BosModule getModule() {
        return module;
    }

    public void setModule(BosModule module) {
        this.module = module;
    }
}

class BosUserSubModuleId implements Serializable {
    private String userId;
    private Integer subModId;

    public BosUserSubModuleId() {}

    public BosUserSubModuleId(String userId, Integer subModId) {
        this.userId = userId;
        this.subModId = subModId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BosUserSubModuleId that = (BosUserSubModuleId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(subModId, that.subModId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, subModId);
    }
}
