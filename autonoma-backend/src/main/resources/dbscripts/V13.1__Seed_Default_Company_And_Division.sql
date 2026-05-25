-- =============================================
-- Author:      Antigravity
-- Create date: 2026-05-24
-- Description: Seed Default Company, Division, and User-Company/Division Mappings
-- =============================================

-- Seed default company if none exist
IF NOT EXISTS (SELECT 1 FROM [dbo].[AD_COMPANY_CREDENTIAL] WHERE [ID] = 1)
BEGIN
    INSERT INTO [dbo].[AD_COMPANY_CREDENTIAL] (
        [ID],
        [COMPANY_NAME],
        [SHORT_NAME],
        [ADDRESS],
        [CITY],
        [STATE],
        [COUNTRY],
        [PINCODE],
        [GST_IN],
        [DB_SOURCE_NAME],
        [LIC_EXPIRY_DATE],
        [LIC_EXP_REMAINDER_DAYS]
    ) VALUES (
        1,
        'Autonoma ERP Corp',
        'Autonoma',
        '123 Main Street',
        'Chennai',
        'Tamil Nadu',
        'India',
        '600001',
        '33AABCT1234A1Z1',
        'AUTONOMA',
        DATEADD(year, 1, GETDATE()),
        30
    );
    PRINT 'Seeded default company: Autonoma ERP Corp';
END
GO

-- Seed default division if none exist
IF NOT EXISTS (SELECT 1 FROM [dbo].[ad_division_master] WHERE [company_id] = 1)
BEGIN
    INSERT INTO [dbo].[ad_division_master] (
        [company_id],
        [division_name],
        [description],
        [address],
        [city],
        [state],
        [country],
        [pincode],
        [gst_in],
        [status]
    ) VALUES (
        1,
        'Main Division',
        'Primary business division',
        '123 Main Street',
        'Chennai',
        'Tamil Nadu',
        'India',
        '600001',
        '33AABCT1234A1Z1',
        1
    );
    PRINT 'Seeded default division: Main Division';
END
GO

-- Seed default company mapping for Admin if none exist
IF NOT EXISTS (SELECT 1 FROM [dbo].[AD_USER_COMPANY_MAPPING] WHERE [user_id] = 'Admin')
BEGIN
    INSERT INTO [dbo].[AD_USER_COMPANY_MAPPING] (
        [user_id],
        [company_id],
        [created_by]
    ) VALUES (
        'Admin',
        1,
        'SYSTEM'
    );
    PRINT 'Seeded default user-company mapping for Admin';
END
GO

-- Seed default division mapping for Admin if none exist
IF NOT EXISTS (SELECT 1 FROM [dbo].[AD_USER_DIVISION_MAPPING] WHERE [user_id] = 'Admin')
BEGIN
    INSERT INTO [dbo].[AD_USER_DIVISION_MAPPING] (
        [user_id],
        [division_id],
        [created_by]
    )
    SELECT 'Admin', id, 'SYSTEM'
    FROM [dbo].[ad_division_master]
    WHERE [company_id] = 1
      AND NOT EXISTS (SELECT 1 FROM [dbo].[AD_USER_DIVISION_MAPPING] WHERE [user_id] = 'Admin');
    PRINT 'Seeded default user-division mapping for Admin';
END
GO
