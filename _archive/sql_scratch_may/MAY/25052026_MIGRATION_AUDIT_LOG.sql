-- Create Migration Audit Log Table with Foreign Key
USE [AUTONOMA];
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ad_migration_audit_log]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ad_migration_audit_log](
        [id] [bigint] IDENTITY(1,1) NOT NULL,
        [table_name] [nvarchar](100) NOT NULL,
        [migrated_by] [nvarchar](50) NULL,
        [migrated_at] [datetime] NULL DEFAULT (getdate()),
        [status] [nvarchar](50) NULL,
        [records_count] [int] NULL,
        [message] [nvarchar](max) NULL,
        CONSTRAINT [PK_ad_migration_audit_log] PRIMARY KEY CLUSTERED ([id] ASC)
    );

    -- Add Foreign Key constraint referencing ad_user_credential(user_id)
    ALTER TABLE [dbo].[ad_migration_audit_log] WITH CHECK ADD CONSTRAINT [FK_migration_audit_log_user] 
    FOREIGN KEY([migrated_by]) REFERENCES [dbo].[ad_user_credential] ([user_id]);

    ALTER TABLE [dbo].[ad_migration_audit_log] CHECK CONSTRAINT [FK_migration_audit_log_user];

    -- Create Indexes for optimization
    CREATE INDEX [IDX_MIGRATION_AUDIT_LOG_USER] ON [dbo].[ad_migration_audit_log]([migrated_by]);
    CREATE INDEX [IDX_MIGRATION_AUDIT_LOG_DATE] ON [dbo].[ad_migration_audit_log]([migrated_at] DESC);
END
GO
