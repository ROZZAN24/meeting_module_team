-- Add missing columns to ticket_Tracability_center safely

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'page_id')
    ALTER TABLE ticket_Tracability_center ADD page_id INT NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'rework_time')
    ALTER TABLE ticket_Tracability_center ADD rework_time NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'assigned_by')
    ALTER TABLE ticket_Tracability_center ADD assigned_by NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'developer_name')
    ALTER TABLE ticket_Tracability_center ADD developer_name NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'developer_email')
    ALTER TABLE ticket_Tracability_center ADD developer_email NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'developer_mobile_no')
    ALTER TABLE ticket_Tracability_center ADD developer_mobile_no NVARCHAR(50) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'assigned_hours')
    ALTER TABLE ticket_Tracability_center ADD assigned_hours NVARCHAR(50) NULL;

-- Remove unused columns
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'module_name')
    ALTER TABLE ticket_Tracability_center DROP COLUMN module_name;

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND name = 'page_name')
    ALTER TABLE ticket_Tracability_center DROP COLUMN page_name;
