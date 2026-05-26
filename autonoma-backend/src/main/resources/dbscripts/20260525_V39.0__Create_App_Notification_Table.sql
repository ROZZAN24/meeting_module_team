-- =============================================
-- Author:      Antigravity
-- Create date: 2026-05-25
-- Description: Create sys_app_notification table for system notifications
-- =============================================

IF OBJECT_ID('dbo.sys_app_notification', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sys_app_notification] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [recipient_emp_id] BIGINT NOT NULL,
        [title] NVARCHAR(255) NOT NULL,
        [message] NVARCHAR(MAX) NULL,
        [link_url] NVARCHAR(500) NULL,
        [is_read] BIT NOT NULL DEFAULT 0,
        [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_sys_app_notification_employee FOREIGN KEY ([recipient_emp_id]) REFERENCES [dbo].[hrm_employee_master]([id])
    );
END
GO
