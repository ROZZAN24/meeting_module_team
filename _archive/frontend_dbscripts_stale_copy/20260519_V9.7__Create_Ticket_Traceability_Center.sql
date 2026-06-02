-- Create Support Ticketing Tables (Consolidated Schema)

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ticket_Tracability_center]') AND type in (N'U'))
BEGIN
    CREATE TABLE ticket_Tracability_center (
        row_id INT IDENTITY(1,1) PRIMARY KEY,
        ticket_id NVARCHAR(50) NOT NULL UNIQUE,
        ticket_type NVARCHAR(50) NOT NULL DEFAULT 'Internal',
        title NVARCHAR(255) NOT NULL,
        module_name NVARCHAR(100) NULL,
        page_name NVARCHAR(100) NULL,
        employee_code NVARCHAR(50) NULL,
        employee_name NVARCHAR(100) NULL,
        email NVARCHAR(100) NULL,
        mobile_no NVARCHAR(50) NULL,
        department NVARCHAR(100) NULL,
        description NVARCHAR(MAX) NULL,
        priority_level NVARCHAR(50) NULL,
        severity_level NVARCHAR(50) NULL,
        ticket_status NVARCHAR(50) NOT NULL DEFAULT 'Open',
        assigned_to NVARCHAR(100) NULL,
        assigned_by NVARCHAR(100) NULL,
        developer_name NVARCHAR(100) NULL,
        developer_email NVARCHAR(100) NULL,
        developer_mobile_no NVARCHAR(50) NULL,
        due_date DATETIME NULL,
        target_date DATETIME NULL,
        taken_time NVARCHAR(100) NULL,
        assigned_hours NVARCHAR(50) NULL,
        due_date_reason NVARCHAR(MAX) NULL,
        resolved_at DATETIME NULL,
        closed_at DATETIME NULL,
        reopened_count INT NOT NULL DEFAULT 0,
        resolution_summary NVARCHAR(MAX) NULL,
        root_cause NVARCHAR(MAX) NULL,
        source_type NVARCHAR(100) NULL,
        attachment_path NVARCHAR(500) NULL,
        created_by NVARCHAR(100) NOT NULL,
        created_at DATETIME NULL DEFAULT GETDATE(),
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );
END;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ticket_attachments]') AND type in (N'U'))
BEGIN
    CREATE TABLE ticket_attachments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ticket_row_id INT NOT NULL,
        file_name NVARCHAR(255) NOT NULL,
        file_path NVARCHAR(500) NOT NULL,
        file_type NVARCHAR(50) NULL,
        ticket_id NVARCHAR(50) NULL,
        uploaded_by NVARCHAR(100) NOT NULL,
        uploaded_at DATETIME NULL DEFAULT GETDATE()
    );
END;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ticket_comments]') AND type in (N'U'))
BEGIN
    CREATE TABLE ticket_comments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ticket_row_id INT NOT NULL,
        commented_by NVARCHAR(100) NOT NULL,
        comment_type NVARCHAR(50) NOT NULL,
        comments NVARCHAR(MAX) NULL,
        attachment_path NVARCHAR(500) NULL,
        created_at DATETIME NULL DEFAULT GETDATE()
    );
END;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ticket_reopen_history]') AND type in (N'U'))
BEGIN
    CREATE TABLE ticket_reopen_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ticket_row_id INT NOT NULL,
        reopened_by NVARCHAR(100) NOT NULL,
        reopened_at DATETIME NULL DEFAULT GETDATE(),
        reason NVARCHAR(MAX) NULL,
        expected_duration NVARCHAR(100) NULL,
        reopen_target_date DATETIME NULL
    );
END;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ticket_status_history]') AND type in (N'U'))
BEGIN
    CREATE TABLE ticket_status_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ticket_row_id INT NOT NULL,
        from_status NVARCHAR(50) NULL,
        to_status NVARCHAR(50) NOT NULL,
        updated_by NVARCHAR(100) NOT NULL,
        updated_at DATETIME NULL DEFAULT GETDATE(),
        comment NVARCHAR(MAX) NULL
    );
END;
GO
