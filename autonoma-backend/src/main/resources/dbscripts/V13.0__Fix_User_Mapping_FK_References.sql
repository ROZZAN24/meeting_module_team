-- =============================================
-- Author:      Antigravity
-- Create date: 2026-05-18
-- Description: Fix FK constraints on AD_USER_DIVISION_MAPPING and AD_USER_COMPANY_MAPPING
--              to reference the active 'ad_user_credential' table instead of the legacy
--              'AD_USER_CREDENTIALS' table. The old table was renamed in V4.2 but the
--              FKs created in V12.0 still reference the original name.
-- =============================================

-- 1. Drop the old FK constraints that reference the legacy AD_USER_CREDENTIALS table
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_UserDiv_User')
    ALTER TABLE [dbo].[AD_USER_DIVISION_MAPPING] DROP CONSTRAINT [FK_UserDiv_User];

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_UserComp_User')
    ALTER TABLE [dbo].[AD_USER_COMPANY_MAPPING] DROP CONSTRAINT [FK_UserComp_User];

-- 2. Re-create the FK constraints pointing to the correct active table 'ad_user_credential'
ALTER TABLE [dbo].[AD_USER_DIVISION_MAPPING]
    ADD CONSTRAINT [FK_UserDiv_User]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[ad_user_credential]([user_id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[AD_USER_COMPANY_MAPPING]
    ADD CONSTRAINT [FK_UserComp_User]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[ad_user_credential]([user_id]) ON DELETE CASCADE;
