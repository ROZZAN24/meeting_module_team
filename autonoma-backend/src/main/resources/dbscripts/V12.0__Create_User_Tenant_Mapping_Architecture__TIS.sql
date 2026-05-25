
-- =============================================
-- Author:      Antigravity
-- Create date: 2026-05-16
-- Description: Create User-Company and User-Division Mapping tables for Multi-Tenancy
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AD_USER_COMPANY_MAPPING]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[AD_USER_COMPANY_MAPPING] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [user_id] NVARCHAR(50) NOT NULL,
    [company_id] BIGINT NOT NULL,
    [created_by] NVARCHAR(50),
    [created_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_UserComp_User FOREIGN KEY ([user_id]) REFERENCES ad_user_credential([user_id]) ON DELETE CASCADE
);
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AD_USER_DIVISION_MAPPING]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[AD_USER_DIVISION_MAPPING] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [user_id] NVARCHAR(50) NOT NULL,
    [division_id] BIGINT NOT NULL,
    [created_by] NVARCHAR(50),
    [created_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_UserDiv_User FOREIGN KEY ([user_id]) REFERENCES ad_user_credential([user_id]) ON DELETE CASCADE
);
END

-- Seed mapping for default Admin user if companies exist
-- This ensures the first user can still login after these mappings are enforced.
INSERT INTO [dbo].[AD_USER_COMPANY_MAPPING] ([user_id], [company_id], [created_by])
SELECT 'Admin', id, 'SYSTEM' FROM ad_company_credential WHERE NOT EXISTS (SELECT 1 FROM AD_USER_COMPANY_MAPPING WHERE [user_id] = 'Admin');

INSERT INTO [dbo].[AD_USER_DIVISION_MAPPING] ([user_id], [division_id], [created_by])
SELECT 'Admin', id, 'SYSTEM' FROM ad_division_master WHERE NOT EXISTS (SELECT 1 FROM AD_USER_DIVISION_MAPPING WHERE [user_id] = 'Admin');

