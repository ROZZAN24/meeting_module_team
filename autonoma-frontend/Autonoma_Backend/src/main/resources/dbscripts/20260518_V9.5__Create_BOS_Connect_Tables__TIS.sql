-- Create BOS Connect Chat Channel table
IF OBJECT_ID('COMM_CHANNEL', 'U') IS NULL
BEGIN
    CREATE TABLE COMM_CHANNEL (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        channel_name NVARCHAR(255),
        channel_type NVARCHAR(50) NOT NULL, -- DIRECT, DEPARTMENT, PROJECT, TEAM, WORKFLOW, TASK
        department_id BIGINT NULL,
        created_by NVARCHAR(50),
        created_at DATETIME DEFAULT GETDATE()
    )
END
GO

-- Create BOS Connect Channel Members table
IF OBJECT_ID('COMM_CHANNEL_MEMBER', 'U') IS NULL
BEGIN
    CREATE TABLE COMM_CHANNEL_MEMBER (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        channel_id BIGINT NOT NULL,
        user_id NVARCHAR(50) NOT NULL,
        joined_at DATETIME DEFAULT GETDATE(),
        last_read_message_id BIGINT NULL
    )
END
GO

-- Create BOS Connect Messages table
IF OBJECT_ID('COMM_MESSAGE', 'U') IS NULL
BEGIN
    CREATE TABLE COMM_MESSAGE (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        channel_id BIGINT NOT NULL,
        sender_id NVARCHAR(50) NOT NULL,
        sender_name NVARCHAR(255) NOT NULL,
        message_type NVARCHAR(50) NOT NULL, -- TEXT, FILE, SYSTEM, ACTION, VOICE
        message_content NVARCHAR(MAX),
        attachment_url NVARCHAR(MAX) NULL,
        attachment_name NVARCHAR(255) NULL,
        attachment_type NVARCHAR(50) NULL, -- PDF, EXCEL, IMAGE, DOC
        created_at DATETIME DEFAULT GETDATE()
    )
END
GO

-- Create BOS Connect User Status table
IF OBJECT_ID('COMM_USER_STATUS', 'U') IS NULL
BEGIN
    CREATE TABLE COMM_USER_STATUS (
        user_id NVARCHAR(50) PRIMARY KEY,
        is_online INT DEFAULT 0,
        last_seen DATETIME DEFAULT GETDATE(),
        is_typing_channel_id BIGINT NULL,
        updated_at DATETIME DEFAULT GETDATE()
    )
END
GO
