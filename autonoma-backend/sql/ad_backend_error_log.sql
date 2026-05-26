-- SQL DDL schema for creating ad_backend_error_log database table
-- Used to capture and monitor centralized backend exceptions across the ERP platform.

CREATE TABLE ad_backend_error_log (
    id BIGINT IDENTITY(1,1) NOT NULL,
    module_name VARCHAR(255) NULL,
    api_endpoint VARCHAR(255) NULL,
    exception_type VARCHAR(255) NULL,
    error_message NVARCHAR(MAX) NULL,
    error_stack NVARCHAR(MAX) NULL,
    username VARCHAR(255) NULL,
    timestamp DATETIME NULL,
    sql_table_name VARCHAR(255) NULL,
    sql_field_name VARCHAR(255) NULL,
    http_method VARCHAR(50) NULL,
    request_path VARCHAR(255) NULL,
    server_response_status INT NULL,
    CONSTRAINT PK_ad_backend_error_log PRIMARY KEY (id)
);
