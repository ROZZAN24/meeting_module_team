package com.autonoma.erp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuditContextInterceptor auditContextInterceptor;

    public WebConfig(AuditContextInterceptor auditContextInterceptor) {
        this.auditContextInterceptor = auditContextInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auditContextInterceptor)
                .addPathPatterns("/**"); // Apply to all paths
    }

    /**
     * Cache-control strategy:
     *  - /assets/** (hashed filenames) → cache 1 year (immutable)
     *  - Everything else (index.html, manifest.json) → no-cache so browsers
     *    always re-validate after a new deployment, preventing MIME-type crashes.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Hashed JS/CSS/font assets — safe to cache long-term (filename changes on rebuild)
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable());

        // Everything else (index.html, logo, manifest) — never cache
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noStore());
    }

    @Bean
    public StandardServletMultipartResolver multipartResolver() {
        StandardServletMultipartResolver resolver = new StandardServletMultipartResolver();
        resolver.setStrictServletCompliance(false);
        return resolver;
    }
}
