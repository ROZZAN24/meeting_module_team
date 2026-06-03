-- V4.19 Add LIC_EXP_REMAINDER_DAYS to ad_company_credential
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_company_credential]') AND name = 'LIC_EXP_REMAINDER_DAYS')
BEGIN
    ALTER TABLE [dbo].[ad_company_credential] ADD [LIC_EXP_REMAINDER_DAYS] BIGINT DEFAULT 30;
END
GO

-- Seed default company profile if empty
IF NOT EXISTS (SELECT * FROM [dbo].[ad_company_credential])
BEGIN
    INSERT INTO [dbo].[ad_company_credential] (
        [company_name], [short_name], [address], [city], [state], [state_cd], [country], [pincode], 
        [gst_in], [lic_renewal_date], [lic_expiry_date], [logo_file_name], [login_bg_file_name], 
        [db_source_name], [dir_path], [created_by], [created_at], [LIC_EXP_REMAINDER_DAYS]
    ) VALUES (
        'Autonoma ERP Solutions', 'Autonoma', '123 Tech Park', 'Bangalore', 'Karnataka', 29, 'India', '560001',
        '29AAAAA0000A1Z5', GETDATE(), DATEADD(year, 1, GETDATE()), 'logo.png', 'login-bg.jpg',
        'AUTONOMA', '/uploads', 'System', GETDATE(), 365
    );
END
GO
