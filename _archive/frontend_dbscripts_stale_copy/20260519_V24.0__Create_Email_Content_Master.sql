-- Create Email Content Master Table
CREATE TABLE hr_email_content (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    type NVARCHAR(100) NOT NULL,
    subject NVARCHAR(500) NOT NULL,
    body_content NVARCHAR(MAX) NOT NULL,
    yours_windfully NVARCHAR(200) NOT NULL,
    status NVARCHAR(20) DEFAULT 'ACTIVE',
    created_by NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_by NVARCHAR(100),
    updated_at DATETIME
);
GO
