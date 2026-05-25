-- ============================================================================
-- V5.0 : Create Division Master Table (Consolidated Final Schema)
-- Divisions are linked to ad_company_credential (companyId).
-- Maintains physical location/address details in full parity with Company Master.
-- Divisional transactions in tenant databases reference the division_id via
-- the BaseDivisionTenantEntity filter.
-- ============================================================================

IF OBJECT_ID('ad_division_master', 'U') IS NULL
BEGIN
    CREATE TABLE ad_division_master (
        id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        company_id      BIGINT         NOT NULL,   -- FK (logical) → ad_company_credential.id
        division_name   NVARCHAR(100)  NOT NULL,
        description     NVARCHAR(250)  NULL,
        address         NVARCHAR(500)  NULL,
        city            NVARCHAR(50)   NULL,
        state           NVARCHAR(50)   NULL,
        state_cd        INT            NULL,
        country         NVARCHAR(50)   NULL,
        pincode         NVARCHAR(10)   NULL,
        gst_in          NVARCHAR(15)   NULL,
        seq_no          INT            NOT NULL DEFAULT 0,
        status          BIT            NOT NULL DEFAULT 1,    -- 1 = Active, 0 = Inactive
        created_by      NVARCHAR(50)   NULL,
        created_at      DATETIME       NULL,
        updated_by      NVARCHAR(50)   NULL,
        updated_at      DATETIME       NULL
    )
    PRINT 'Created table: ad_division_master'
END
ELSE
BEGIN
    PRINT 'Table already exists: ad_division_master'
END
GO

-- Index: fast lookup by company
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_division_company_id'
      AND object_id = OBJECT_ID('ad_division_master')
)
BEGIN
    CREATE INDEX IX_division_company_id ON ad_division_master (company_id)
    PRINT 'Created index: IX_division_company_id'
END
GO

-- Index: fast lookup by status
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_division_status'
      AND object_id = OBJECT_ID('ad_division_master')
)
BEGIN
    CREATE INDEX IX_division_status ON ad_division_master (status)
    PRINT 'Created index: IX_division_status'
END
GO

-- Seed default division if empty
IF NOT EXISTS (SELECT * FROM ad_division_master)
BEGIN
    SET IDENTITY_INSERT ad_division_master ON;
    INSERT INTO ad_division_master (id, company_id, division_name, status, created_by, created_at)
    VALUES (1, 1, 'Corporate Division', 1, 'SYSTEM', GETDATE());
    SET IDENTITY_INSERT ad_division_master OFF;
    PRINT 'Seeded default division'
END
GO
