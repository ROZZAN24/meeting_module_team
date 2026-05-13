-- Audit Module Schema (SQL Server)
-- Generated from JPA Models

CREATE TABLE audit_types (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    audit_type NVARCHAR(255),
    standard NVARCHAR(255),
    description NVARCHAR(MAX),
    criteria_min_count INT,
    customer_audit_area NVARCHAR(255),
    audit_area NVARCHAR(255),
    criteria_type NVARCHAR(255),
    status NVARCHAR(50),
    created_by NVARCHAR(255),
    created_date DATETIME,
    updated_by NVARCHAR(255),
    updated_date DATETIME,
    is_deleted BIT DEFAULT 0
);

CREATE TABLE audit_areas (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    audit_area NVARCHAR(255),
    description NVARCHAR(MAX),
    status NVARCHAR(50),
    created_by NVARCHAR(255),
    created_date DATETIME,
    updated_by NVARCHAR(255),
    updated_date DATETIME,
    is_deleted BIT DEFAULT 0
);

CREATE TABLE audit_criteria (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    audit_type NVARCHAR(255),
    seq_no INT,
    clause NVARCHAR(255),
    criteria_details NVARCHAR(MAX),
    attachment_req NVARCHAR(50),
    status NVARCHAR(50),
    created_by NVARCHAR(255),
    created_date DATETIME,
    updated_by NVARCHAR(255),
    updated_date DATETIME,
    is_deleted BIT DEFAULT 0
);

CREATE TABLE audit_schedules (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    schedule_no NVARCHAR(255),
    schedule_date DATE,
    status NVARCHAR(50),
    audit_type NVARCHAR(255),
    item_code NVARCHAR(255),
    audit_area NVARCHAR(255),
    audit_date DATE,
    audit_month NVARCHAR(50),
    start_time NVARCHAR(50),
    end_time NVARCHAR(50),
    department NVARCHAR(255),
    auditee NVARCHAR(255),
    auditor NVARCHAR(255),
    ncr_approved_by NVARCHAR(255),
    created_by NVARCHAR(255),
    created_date DATETIME,
    updated_by NVARCHAR(255),
    updated_date DATETIME,
    is_deleted BIT DEFAULT 0
);

CREATE TABLE audit_schedule_criteria (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    audit_schedule_id BIGINT,
    seq_no INT,
    clause NVARCHAR(255),
    criteria_details NVARCHAR(MAX),
    attachment_req NVARCHAR(50),
    remarks NVARCHAR(MAX),
    FOREIGN KEY (audit_schedule_id) REFERENCES audit_schedules(id) ON DELETE CASCADE
);

CREATE TABLE departments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    dept_name NVARCHAR(255),
    dept_code NVARCHAR(50),
    description NVARCHAR(MAX),
    status NVARCHAR(50),
    created_by NVARCHAR(255),
    created_date DATETIME,
    updated_by NVARCHAR(255),
    updated_date DATETIME,
    is_deleted BIT DEFAULT 0
);
