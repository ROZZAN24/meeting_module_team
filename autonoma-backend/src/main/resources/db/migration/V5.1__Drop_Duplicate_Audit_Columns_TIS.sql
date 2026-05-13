-- V5.1 Drop Duplicate Audit Columns
USE [AUTONOMA];
GO

-- Drop duplicate columns created by Hibernate auto-DDL in previous versions
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('audit_schedule') AND name = 'ncrapprovedby')
BEGIN
    ALTER TABLE audit_schedule DROP COLUMN ncrapprovedby;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('audit_schedule_criteria') AND name = 'attachmentreq')
BEGIN
    ALTER TABLE audit_schedule_criteria DROP COLUMN attachmentreq;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('audit_schedule_criteria') AND name = 'criteriadetails')
BEGIN
    ALTER TABLE audit_schedule_criteria DROP COLUMN criteriadetails;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('audit_schedule_criteria') AND name = 'seqno')
BEGIN
    ALTER TABLE audit_schedule_criteria DROP COLUMN seqno;
END

GO
