package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bos_modules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BosModule {

    @Id
    @Column(name = "module_id")
    private Integer moduleId;

    @Column(name = "mod_code", columnDefinition = "NVARCHAR(10)")
    private String modCode;

    @Column(name = "mod_name", columnDefinition = "NVARCHAR(100)")
    private String modName;

    public Integer getModuleId() {
        return moduleId;
    }

    public void setModuleId(Integer moduleId) {
        this.moduleId = moduleId;
    }

    public String getModCode() {
        return modCode;
    }

    public void setModCode(String modCode) {
        this.modCode = modCode;
    }

    public String getModName() {
        return modName;
    }

    public void setModName(String modName) {
        this.modName = modName;
    }
}
