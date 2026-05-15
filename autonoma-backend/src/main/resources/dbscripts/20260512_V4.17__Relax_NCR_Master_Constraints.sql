-- V4.17 Relax NCR Master Constraints
USE [AUTONOMA];

ALTER TABLE ncr_ofi_master ALTER COLUMN auditee_id INT NULL;
ALTER TABLE ncr_ofi_master ALTER COLUMN ncr_approver_id INT NULL;

-- Also add personnel name columns to master for redundancy (SOP compliance)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ncr_ofi_master]') AND name = 'auditee_name')
    ALTER TABLE ncr_ofi_master ADD auditee_name NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ncr_ofi_master]') AND name = 'ncr_approver_name')
    ALTER TABLE ncr_ofi_master ADD ncr_approver_name NVARCHAR(255);
