-- ============================================================
-- V43.0 Add missing CONTACT_PERSON and WEBSITE columns
--       to sm_supplier_master matching JPA SupplierMaster Entity.
-- ============================================================
USE [AUTONOMA];
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'CONTACT_PERSON')
BEGIN
    ALTER TABLE sm_supplier_master ADD CONTACT_PERSON NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'WEBSITE')
BEGIN
    ALTER TABLE sm_supplier_master ADD WEBSITE NVARCHAR(100) NULL;
END
GO
