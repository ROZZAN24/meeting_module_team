package com.autonoma.erp.model.admin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Table(name = "ad_user_theme_setting")
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class UserThemeSetting {

    @Id
    @Column(name = "user_id", columnDefinition = "NVARCHAR(50)")
    private String userId;

    @Column(name = "theme_mode", columnDefinition = "NVARCHAR(20)")
    private String themeMode = "system";

    @Column(name = "menu_orientation", columnDefinition = "NVARCHAR(20)")
    private String menuOrientation = "vertical";

    @Column(name = "mini_drawer")
    private Boolean miniDrawer = false;

    @Column(name = "font_family", columnDefinition = "NVARCHAR(100)")
    private String fontFamily = "'Roboto', sans-serif";

    @Column(name = "border_radius")
    private Integer borderRadius = 8;

    @Column(name = "outlined_filled")
    private Boolean outlinedFilled = true;

    @Column(name = "preset_color", columnDefinition = "NVARCHAR(50)")
    private String presetColor = "default";

    @Column(name = "i18n", columnDefinition = "NVARCHAR(20)")
    private String i18n = "en";

    @Column(name = "theme_direction", columnDefinition = "NVARCHAR(20)")
    private String themeDirection = "ltr";

    @Column(name = "container")
    private Boolean container = false;

    @Column(name = "face_login_enabled")
    private Boolean faceLoginEnabled = false;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    public Boolean getFaceLoginEnabled() {
        return faceLoginEnabled;
    }

    public void setFaceLoginEnabled(Boolean faceLoginEnabled) {
        this.faceLoginEnabled = faceLoginEnabled;
    }
}
