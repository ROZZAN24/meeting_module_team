package com.autonoma.erp.config;

import com.autonoma.erp.util.FrontendBuildRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class FrontendBuildStartup implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(FrontendBuildStartup.class);

    @Value("${autonoma.frontend.build-on-startup:false}")
    private boolean buildOnStartup;

    @Value("${autonoma.frontend.path:}")
    private String frontendPath;

    @Value("${autonoma.frontend.target-static-path:}")
    private String targetStaticPath;

    @Autowired
    private FrontendBuildRunner frontendBuildRunner;

    @Override
    public void run(ApplicationArguments args) {
        if (buildOnStartup) {
            log.info("Detected 'autonoma.frontend.build-on-startup=true'. Executing frontend build and sync...");
            boolean success = frontendBuildRunner.runBuild(frontendPath, targetStaticPath);
            if (success) {
                log.info("Frontend startup build execution finished successfully.");
            } else {
                log.error("Frontend startup build execution failed. Using existing files (if any) in static resource folder.");
            }
        } else {
            log.info("Frontend build-on-startup is disabled. Skipping startup build.");
        }
    }
}
