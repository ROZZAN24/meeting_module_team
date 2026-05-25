-- V14.7 Create NPD Wind Farm Table
-- Standard Flyway Migration

IF OBJECT_ID('npd_wind_farm', 'U') IS NULL
BEGIN
    CREATE TABLE npd_wind_farm (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        wind_farm_name NVARCHAR(100) NOT NULL UNIQUE,
        city NVARCHAR(100) NOT NULL,
        state NVARCHAR(100) NOT NULL,
        country NVARCHAR(100) NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );
END;
GO
