package com.autonoma.erp.controller.admin;

import com.autonoma.erp.model.admin.UserThemeSetting;
import com.autonoma.erp.repository.admin.UserThemeSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/theme-settings")
@CrossOrigin(origins = "*")
public class UserThemeSettingController {

    @Autowired
    private UserThemeSettingRepository userThemeSettingRepository;

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    @GetMapping
    public ResponseEntity<UserThemeSetting> getThemeSettings() {
        String userId = getCurrentUserId();
        if ("SYSTEM".equals(userId)) {
            return ResponseEntity.ok(new UserThemeSetting());
        }

        Optional<UserThemeSetting> settingsOpt = userThemeSettingRepository.findById(userId);
        if (settingsOpt.isPresent()) {
            return ResponseEntity.ok(settingsOpt.get());
        } else {
            UserThemeSetting defaultSettings = new UserThemeSetting();
            defaultSettings.setUserId(userId);
            defaultSettings.setThemeMode("system");
            defaultSettings.setMenuOrientation("vertical");
            defaultSettings.setMiniDrawer(false);
            defaultSettings.setFontFamily("'Roboto', sans-serif");
            defaultSettings.setBorderRadius(8);
            defaultSettings.setOutlinedFilled(true);
            defaultSettings.setPresetColor("default");
            defaultSettings.setI18n("en");
            defaultSettings.setThemeDirection("ltr");
            defaultSettings.setContainer(false);
            defaultSettings.setUpdatedAt(new Date());
            return ResponseEntity.ok(defaultSettings);
        }
    }

    @PostMapping
    public ResponseEntity<UserThemeSetting> saveThemeSettings(@RequestBody UserThemeSetting settings) {
        String userId = getCurrentUserId();
        if ("SYSTEM".equals(userId)) {
            return ResponseEntity.badRequest().build();
        }

        settings.setUserId(userId);
        settings.setUpdatedAt(new Date());
        UserThemeSetting saved = userThemeSettingRepository.save(settings);
        return ResponseEntity.ok(saved);
    }
}
