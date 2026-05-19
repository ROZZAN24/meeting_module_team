package com.autonoma.erp.service.admin;

import com.autonoma.erp.config.DynamicRoutingDataSource;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;

@Service
public class TenantDataSourceService {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private DataSourceProperties dataSourceProperties;

    public void createTenantDataSource(String tenantId) {
        if (!(dataSource instanceof DynamicRoutingDataSource)) {
            return;
        }

        DynamicRoutingDataSource routingDataSource = (DynamicRoutingDataSource) dataSource;

        if (routingDataSource.containsDataSource(tenantId)) {
            return;
        }

        synchronized (this) {
            if (routingDataSource.containsDataSource(tenantId)) {
                return;
            }

            String masterUrl = dataSourceProperties.getUrl();
            if (masterUrl == null) return;

            String tenantUrl = masterUrl.replaceAll("(?i)databaseName=[^;]*", "databaseName=" + tenantId.trim());
            
            // Ensure no duplicate databaseName parameters if replacement was tricky
            if (!tenantUrl.toLowerCase().contains("databasename=" + tenantId.toLowerCase())) {
                 tenantUrl = masterUrl + ";databaseName=" + tenantId.trim();
            }

            HikariDataSource tenantDs = dataSourceProperties.initializeDataSourceBuilder()
                    .type(HikariDataSource.class)
                    .build();
            
            tenantDs.setJdbcUrl(tenantUrl);
            tenantDs.setPoolName(tenantId.trim() + "-Pool");
            
            // Optimization for Multi-Tenancy
            tenantDs.setMinimumIdle(1);
            tenantDs.setMaximumPoolSize(10);
            tenantDs.setIdleTimeout(300000); // 5 minutes
            tenantDs.setConnectionTimeout(20000);

            routingDataSource.addDataSource(tenantId, tenantDs);
            System.out.println("Lazy-initialized connection pool for tenant: " + tenantId);
        }
    }
}
