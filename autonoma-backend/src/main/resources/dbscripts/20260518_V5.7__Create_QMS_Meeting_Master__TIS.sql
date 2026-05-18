-- Create QMS Meeting Master Table
CREATE TABLE qms_meeting_master (
    id INT IDENTITY(1,1) PRIMARY KEY,
    meeting_name NVARCHAR(255) NOT NULL,
    meeting_description NVARCHAR(MAX) NOT NULL,
    meeting_prefix NVARCHAR(50) NOT NULL,
    meeting_agenda NVARCHAR(MAX) NOT NULL,
    employee_name NVARCHAR(255), -- Responsible Employee
    status NVARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE / INACTIVE
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    created_by NVARCHAR(100),
    updated_by NVARCHAR(100)
);
GO
