-- V8.5 Add specific document upload fields to Customer and Supplier Masters
USE [AUTONOMA];

-- Customer Master: PAN File Info
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_customer_master') AND name = 'pan_file_info')
BEGIN
    ALTER TABLE sm_customer_master ADD pan_file_info NVARCHAR(1000);
END;

-- Supplier Master: PAN, MSME, ISO File Info
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'pan_file_info')
BEGIN
    ALTER TABLE sm_supplier_master ADD pan_file_info NVARCHAR(1000);
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'msme_file_info')
BEGIN
    ALTER TABLE sm_supplier_master ADD msme_file_info NVARCHAR(1000);
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'iso_file_info')
BEGIN
    ALTER TABLE sm_supplier_master ADD iso_file_info NVARCHAR(1000);
END;
