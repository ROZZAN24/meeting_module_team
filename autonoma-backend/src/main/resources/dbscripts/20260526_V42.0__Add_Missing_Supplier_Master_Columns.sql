-- ============================================================
-- V42.0 Add missing Supplier Master (Vendor Master) Bank Details
--       and other missing columns mapping to JPA Entity.
-- ============================================================
USE [AUTONOMA];
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'ACCOUNT_NAME')
BEGIN
    ALTER TABLE sm_supplier_master ADD ACCOUNT_NAME NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'ACCOUNT_NO')
BEGIN
    ALTER TABLE sm_supplier_master ADD ACCOUNT_NO NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'ACCOUNT_TYPE')
BEGIN
    ALTER TABLE sm_supplier_master ADD ACCOUNT_TYPE NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'BANK_NAME')
BEGIN
    ALTER TABLE sm_supplier_master ADD BANK_NAME NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'BRANCH_NAME')
BEGIN
    ALTER TABLE sm_supplier_master ADD BRANCH_NAME NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'IFSC_CODE')
BEGIN
    ALTER TABLE sm_supplier_master ADD IFSC_CODE NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'SWIFT_CODE')
BEGIN
    ALTER TABLE sm_supplier_master ADD SWIFT_CODE NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'TYPE_OF_SERVICE')
BEGIN
    ALTER TABLE sm_supplier_master ADD TYPE_OF_SERVICE NVARCHAR(100) NULL;
END
GO
