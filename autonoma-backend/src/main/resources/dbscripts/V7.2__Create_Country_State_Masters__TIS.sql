-- Create Country and State Master Tables
-- Version: 7.2
-- Description: Added Country and State master tables for standardized address selection.

-- 1. Country Master
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MASTER_COUNTRY]') AND type in (N'U'))
BEGIN
    CREATE TABLE MASTER_COUNTRY (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        COUNTRY NVARCHAR(100),
        STATUS NVARCHAR(20) DEFAULT 'Active'
    );
END

-- 2. State Master
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MASTER_STATE]') AND type in (N'U'))
BEGIN
    CREATE TABLE MASTER_STATE (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        COUNTRY_NAME NVARCHAR(100),
        STATE_NAME NVARCHAR(100),
        STATE_CODE NVARCHAR(20),
        STATUS NVARCHAR(20) DEFAULT 'Active'
    );
END

-- Seed basic data (only if Country table was empty or just created)
IF NOT EXISTS (SELECT 1 FROM MASTER_COUNTRY WHERE COUNTRY = 'India')
    INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('India', 'Active');

IF NOT EXISTS (SELECT 1 FROM MASTER_COUNTRY WHERE COUNTRY = 'USA')
    INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('USA', 'Active');

IF NOT EXISTS (SELECT 1 FROM MASTER_COUNTRY WHERE COUNTRY = 'Germany')
    INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('Germany', 'Active');

