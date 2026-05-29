-- ============================================================
-- Migration: Create hr_induction_round_master table
-- Purpose: Dynamic screening rounds for the Induction module
-- Date: 2026-05-26
-- ============================================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'hr_induction_round_master')
BEGIN
    CREATE TABLE hr_induction_round_master (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        round_name      NVARCHAR(100) NOT NULL UNIQUE,
        description     NVARCHAR(500) NULL,
        status          NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        display_order   INT NULL,
        created_by      NVARCHAR(100) NULL,
        created_at      DATETIME2 NULL DEFAULT GETDATE(),
        updated_by      NVARCHAR(100) NULL,
        updated_at      DATETIME2 NULL
    );
END;

-- Seed the default rounds that were previously hardcoded
IF NOT EXISTS (SELECT 1 FROM hr_induction_round_master WHERE round_name = 'HR')
    INSERT INTO hr_induction_round_master (round_name, description, status, display_order, created_by, created_at)
    VALUES ('HR', 'Human Resources induction round', 'ACTIVE', 1, 'SYSTEM', GETDATE());

IF NOT EXISTS (SELECT 1 FROM hr_induction_round_master WHERE round_name = 'QMS')
    INSERT INTO hr_induction_round_master (round_name, description, status, display_order, created_by, created_at)
    VALUES ('QMS', 'Quality Management System induction round', 'ACTIVE', 2, 'SYSTEM', GETDATE());

IF NOT EXISTS (SELECT 1 FROM hr_induction_round_master WHERE round_name = 'DEPARTMENT')
    INSERT INTO hr_induction_round_master (round_name, description, status, display_order, created_by, created_at)
    VALUES ('DEPARTMENT', 'Department-specific induction round', 'ACTIVE', 3, 'SYSTEM', GETDATE());

IF NOT EXISTS (SELECT 1 FROM hr_induction_round_master WHERE round_name = 'MANAGEMENT')
    INSERT INTO hr_induction_round_master (round_name, description, status, display_order, created_by, created_at)
    VALUES ('MANAGEMENT', 'Management-level induction round', 'ACTIVE', 4, 'SYSTEM', GETDATE());
