-- Create Induction Master Table
CREATE TABLE hr_induction_master (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    induction_details NVARCHAR(1000) NOT NULL,
    answer NVARCHAR(2000) NOT NULL,
    department_codes NVARCHAR(500),
    level_codes NVARCHAR(500),
    induction_round NVARCHAR(100),
    attachment_required NVARCHAR(10) DEFAULT 'NO',
    induction_attachment NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'ACTIVE',
    created_by NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_by NVARCHAR(100),
    updated_at DATETIME
);
GO
