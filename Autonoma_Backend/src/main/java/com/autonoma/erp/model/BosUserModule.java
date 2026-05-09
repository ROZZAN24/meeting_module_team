package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "bos_user_module")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(BosUserModuleId.class)
public class BosUserModule {

    @Id
    @Column(name = "user_id", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Id
    @Column(name = "module_id")
    private Integer moduleId;

    @Column(name = "enabled")
    private Integer enabled;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserCredential user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", insertable = false, updatable = false)
    private BosModule module;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getModuleId() {
        return moduleId;
    }

    public void setModuleId(Integer moduleId) {
        this.moduleId = moduleId;
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

    public BosModule getModule() {
        return module;
    }

    public void setModule(BosModule module) {
        this.module = module;
    }
}

class BosUserModuleId implements Serializable {
    private String userId;
    private Integer moduleId;

    public BosUserModuleId() {}

    public BosUserModuleId(String userId, Integer moduleId) {
        this.userId = userId;
        this.moduleId = moduleId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BosUserModuleId that = (BosUserModuleId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(moduleId, that.moduleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, moduleId);
    }
}
