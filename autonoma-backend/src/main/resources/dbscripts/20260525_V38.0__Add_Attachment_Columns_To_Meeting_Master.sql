-- =============================================
-- Author:      Antigravity
-- Create date: 2026-05-25
-- Description: Add missing attachment columns to qms_meeting_master table to prevent save failures
-- =============================================

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[qms_meeting_master]') 
      AND name = 'attachment_name'
)
BEGIN
    ALTER TABLE [dbo].[qms_meeting_master] ADD [attachment_name] NVARCHAR(255) NULL;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[qms_meeting_master]') 
      AND name = 'attachment_url'
)
BEGIN
    ALTER TABLE [dbo].[qms_meeting_master] ADD [attachment_url] NVARCHAR(2000) NULL;
END
GO
