-- ============================================================
-- Migration: Add TYPE and CONTACT_TYPE to SM_CONTACT_MASTER
-- Purpose: Support type and contact_type fields in SM_CONTACT_MASTER table
-- Date: 2026-06-05
-- ============================================================

USE [AUTONOMA];
GO

IF OBJECT_ID('SM_CONTACT_MASTER', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('SM_CONTACT_MASTER', 'type') IS NULL
    BEGIN
        ALTER TABLE SM_CONTACT_MASTER ADD [type] NVARCHAR(100);
        PRINT 'Added type column to SM_CONTACT_MASTER';
    END

    IF COL_LENGTH('SM_CONTACT_MASTER', 'contact_type') IS NULL
    BEGIN
        ALTER TABLE SM_CONTACT_MASTER ADD [contact_type] NVARCHAR(100);
        PRINT 'Added contact_type column to SM_CONTACT_MASTER';
    END
END
GO
