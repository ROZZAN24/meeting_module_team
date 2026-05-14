-- Create Country and State Master Tables
-- Version: 7.1
-- Description: Added Country and State master tables for standardized address selection.

-- 1. Country Master
CREATE TABLE MASTER_COUNTRY (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    COUNTRY NVARCHAR(100),
    STATUS NVARCHAR(20) DEFAULT 'Active'
);

-- 2. State Master
CREATE TABLE MASTER_STATE (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    COUNTRY_NAME NVARCHAR(100),
    STATE_NAME NVARCHAR(100),
    STATE_CODE NVARCHAR(20),
    STATUS NVARCHAR(20) DEFAULT 'Active'
);

-- Seed basic data (optional, but helpful)
INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('India', 'Active');
INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('USA', 'Active');
INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('Germany', 'Active');
