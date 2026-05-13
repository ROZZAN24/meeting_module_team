package com.autonoma.erp.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DataSourceConfig {

    @Autowired
    private DataSourceProperties dataSourceProperties;

    @Bean(name = "masterDataSource")
    public DataSource masterDataSource() {
        return dataSourceProperties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSource masterDataSource) {
        DynamicRoutingDataSource routingDataSource = new DynamicRoutingDataSource();
        Map<Object, Object> targetDataSources = new HashMap<>();

        routingDataSource.setDefaultTargetDataSource(masterDataSource);
        targetDataSources.put("AUTONOMA", masterDataSource);

        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(masterDataSource);

            Integer tableExists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('ad_company_credential', 'AD_COMPANY_CREDENTIAL')",
                    Integer.class);

            if (tableExists != null && tableExists > 0) {
                List<Map<String, Object>> companies = jdbcTemplate.queryForList(
                        "SELECT db_source_name FROM ad_company_credential WHERE db_source_name IS NOT NULL");

                String masterUrl = dataSourceProperties.getUrl();

                if (masterUrl != null) {
                    for (Map<String, Object> company : companies) {
                        String dbSourceName = (String) company.get("db_source_name");
                        if (dbSourceName != null && !dbSourceName.trim().isEmpty()
                                && !dbSourceName.equalsIgnoreCase("AUTONOMA")) {

                            String tenantUrl = masterUrl.replaceAll("(?i)databaseName=AUTONOMA",
                                    "databaseName=" + dbSourceName.trim());

                            HikariDataSource tenantDs = dataSourceProperties.initializeDataSourceBuilder()
                                    .type(HikariDataSource.class)
                                    .build();
                            tenantDs.setJdbcUrl(tenantUrl);
                            tenantDs.setPoolName(dbSourceName.trim() + "-Pool");
                            tenantDs.setMinimumIdle(1);
                            tenantDs.setMaximumPoolSize(10);

                            targetDataSources.put(dbSourceName.trim(), tenantDs);
                            System.out.println(
                                    "Initialized dynamic multi-tenant connection pool for target DB: "
                                            + dbSourceName.trim());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Dynamic multi-tenant bootstrap deferred until initial migrations complete.");
        }

        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.afterPropertiesSet();
        return routingDataSource;
    }
}
