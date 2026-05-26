-- Migration to create or update prefix credentials table
-- This script handles both fresh installations and updates from older versions

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ad_prefix_credentials] (
        [account_year] VARCHAR(20) NOT NULL PRIMARY KEY,
        [status] INT DEFAULT 1,
        [sales_order_prefix] VARCHAR(20),
        [sales_order_suffix] VARCHAR(20),
        [sales_order_digit] INT,
        [mat_po_prefix] VARCHAR(20),
        [mat_po_suffix] VARCHAR(20),
        [mat_po_digit] INT,
        [gate_entry_prefix] VARCHAR(20),
        [gate_entry_suffix] VARCHAR(20),
        [gate_entry_digit] INT,
        [grn_prefix] VARCHAR(20),
        [grn_suffix] VARCHAR(20),
        [grn_digit] INT,
        [invoice_prefix] VARCHAR(20),
        [invoice_suffix] VARCHAR(20),
        [invoice_digit] INT,
        [created_by] NVARCHAR(100),
        [created_at] DATETIME,
        [updated_by] NVARCHAR(100),
        [updated_at] DATETIME
    );
END
ELSE
BEGIN
    -- Table exists, add missing columns one by one
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'sales_order_suffix')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [sales_order_suffix] VARCHAR(20);

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'sales_order_digit')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [sales_order_digit] INT;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'mat_po_suffix')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [mat_po_suffix] VARCHAR(20);

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'mat_po_digit')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [mat_po_digit] INT;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'gate_entry_suffix')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [gate_entry_suffix] VARCHAR(20);

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'gate_entry_digit')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [gate_entry_digit] INT;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'grn_prefix')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [grn_prefix] VARCHAR(20);

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'grn_suffix')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [grn_suffix] VARCHAR(20);

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'grn_digit')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [grn_digit] INT;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'invoice_suffix')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [invoice_suffix] VARCHAR(20);

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_prefix_credentials]') AND name = 'invoice_digit')
        ALTER TABLE [dbo].[ad_prefix_credentials] ADD [invoice_digit] INT;
END
GO
