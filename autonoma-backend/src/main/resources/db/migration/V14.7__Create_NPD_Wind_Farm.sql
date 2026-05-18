-- V14.7 Create NPD Wind Farm Table and Seed MASTER_STATE
-- Standard Flyway Migration

-- Seed MASTER_STATE so countries and states lookups are functional out-of-the-box
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'MASTER_STATE')
BEGIN
    IF (SELECT COUNT(*) FROM MASTER_STATE) = 0
    BEGIN
        INSERT INTO MASTER_STATE (COUNTRY_NAME, STATE_NAME, STATE_CODE, STATUS)
        VALUES 
        ('INDIA', 'MAHARASHTRA', 'MH', 'Active'),
        ('INDIA', 'TAMIL NADU', 'TN', 'Active'),
        ('INDIA', 'GUJARAT', 'GJ', 'Active'),
        ('INDIA', 'KARNATAKA', 'KA', 'Active'),
        ('INDIA', 'RAJASTHAN', 'RJ', 'Active'),
        ('GERMANY', 'MAHARASHTRA', 'MH', 'Active'), -- Seed for ADAWADI Mumbai/Maharashtra/Germany requested example
        ('GERMANY', 'BAYERN', 'BY', 'Active'),
        ('GERMANY', 'BERLIN', 'BE', 'Active'),
        ('USA', 'CALIFORNIA', 'CA', 'Active'),
        ('USA', 'TEXAS', 'TX', 'Active');
    END;
END;

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

    -- Seed exact example record requested by user
    INSERT INTO npd_wind_farm (wind_farm_name, city, state, country, created_by, created_at, updated_by, updated_at)
    VALUES ('ADAWADI', 'MUMBAI', 'MAHARASHTRA', 'GERMANY', 'MANGAL', '2024-06-21 00:00:00', 'MANGAL', '2024-06-21 00:00:00');
END;
GO
