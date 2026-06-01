-- Add attachment_info to QMS_MOM_DETAIL table
IF OBJECT_ID('QMS_MOM_DETAIL', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[QMS_MOM_DETAIL]') 
          AND name = 'attachment_info'
    )
    BEGIN
        ALTER TABLE QMS_MOM_DETAIL ADD attachment_info NVARCHAR(MAX);
    END
END
GO
