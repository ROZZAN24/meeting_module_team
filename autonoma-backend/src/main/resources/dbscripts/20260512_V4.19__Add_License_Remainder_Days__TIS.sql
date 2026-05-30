-- V4.19 Add LIC_EXP_REMAINDER_DAYS to ad_company_credential
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_company_credential]') AND name = 'LIC_EXP_REMAINDER_DAYS')
BEGIN
    ALTER TABLE [dbo].[ad_company_credential] ADD [LIC_EXP_REMAINDER_DAYS] BIGINT DEFAULT 30;
END
GO

-- Seed default company profile if empty
IF NOT EXISTS (SELECT * FROM [dbo].[ad_company_credential])
BEGIN
    IF COL_LENGTH('ad_company_credential', 'STATE_CODE') IS NOT NULL
    BEGIN
        SET IDENTITY_INSERT [dbo].[ad_company_credential] ON;
        EXEC sp_executesql N'
        INSERT INTO [dbo].[ad_company_credential] (
            [id], [COMPANY_NAME], [SHORT_NAME], [ADDRESS], [CITY], [STATE], [STATE_CODE], [COUNTRY], [PINCODE], 
            [GST_IN], [LIC_RENEWAL_DATE], [LIC_EXPIRY_DATE], [LOGO_FILE_NAME], [LOGIN_BG_FILE_NAME], 
            [DB_SOURCE_NAME], [DIRECTORY_PATH], [CREATED_BY], [CREATED_DATE], [LIC_EXP_REMAINDER_DAYS]
        ) VALUES (
            1, ''Autonoma ERP Solutions'', ''Autonoma'', ''123 Tech Park'', ''Bangalore'', ''Karnataka'', 29, ''India'', ''560001'',
            ''29AAAAA0000A1Z5'', GETDATE(), DATEADD(year, 1, GETDATE()), ''logo.png'', ''login-bg.jpg'',
            ''AUTONOMA'', ''/uploads'', ''System'', GETDATE(), 365
        );'
        SET IDENTITY_INSERT [dbo].[ad_company_credential] OFF;
    END
    ELSE
    BEGIN
        EXEC sp_executesql N'
        INSERT INTO [dbo].[ad_company_credential] (
            [id], [company_name], [short_name], [address], [city], [state], [state_cd], [country], [pincode], 
            [gst_in], [lic_renewal_date], [lic_expiry_date], [logo_file_name], [login_bg_file_name], 
            [db_source_name], [dir_path], [created_by], [created_date], [LIC_EXP_REMAINDER_DAYS]
        ) VALUES (
            1, ''Autonoma ERP Solutions'', ''Autonoma'', ''123 Tech Park'', ''Bangalore'', ''Karnataka'', 29, ''India'', ''560001'',
            ''29AAAAA0000A1Z5'', GETDATE(), DATEADD(year, 1, GETDATE()), ''logo.png'', ''login-bg.jpg'',
            ''AUTONOMA'', ''/uploads'', ''System'', GETDATE(), 365
        );'
    END
END
GO
