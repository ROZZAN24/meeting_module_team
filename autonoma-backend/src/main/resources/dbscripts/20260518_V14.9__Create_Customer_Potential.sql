-- V14.9 Create Customer Potential Table
-- Standard Flyway Migration

IF OBJECT_ID('sm_customer_potential', 'U') IS NULL
BEGIN
    CREATE TABLE sm_customer_potential (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        customer_group_name NVARCHAR(200) NULL,
        customer_code NVARCHAR(50) NOT NULL,
        customer_type NVARCHAR(50) NULL,
        manufacturer_oem NVARCHAR(100) NULL,
        wtg_model NVARCHAR(100) NULL,
        wind_turbine_power NVARCHAR(100) NULL,
        wind_farm_name NVARCHAR(100) NULL,
        area NVARCHAR(200) NULL,
        pincode NVARCHAR(20) NULL,
        state NVARCHAR(100) NULL,
        country NVARCHAR(100) NULL,
        developer NVARCHAR(200) NULL,
        plant_mw DECIMAL(18, 4) NULL,
        turbine_count INT NULL,
        hub NVARCHAR(100) NULL,
        operational_status NVARCHAR(100) NULL,
        commissioning_year NVARCHAR(20) NULL,
        commissioning_month NVARCHAR(20) NULL,
        latitude DECIMAL(18, 6) NULL,
        longitude DECIMAL(18, 6) NULL,
        status NVARCHAR(50) DEFAULT 'Active',
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );
END;
GO
