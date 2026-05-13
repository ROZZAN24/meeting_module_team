-- V4.19 Add missing LIC_EXP_REMAINDER_DAYS column to ad_company_credential table
IF OBJECT_ID('ad_company_credential', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_company_credential]') AND name IN ('LIC_EXP_REMAINDER_DAYS', 'lic_exp_remainder_days'))
    BEGIN
        ALTER TABLE [dbo].[ad_company_credential] ADD [LIC_EXP_REMAINDER_DAYS] INT DEFAULT 30 NOT NULL;
    END
END
ELSE IF OBJECT_ID('AD_COMPANY_CREDENTIAL', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AD_COMPANY_CREDENTIAL]') AND name IN ('LIC_EXP_REMAINDER_DAYS', 'lic_exp_remainder_days'))
    BEGIN
        ALTER TABLE [dbo].[AD_COMPANY_CREDENTIAL] ADD [LIC_EXP_REMAINDER_DAYS] INT DEFAULT 30 NOT NULL;
    END
END
GO
