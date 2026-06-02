-- Create Verification Criteria Master Table
CREATE TABLE hr_verification_criteria (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    type NVARCHAR(100) NOT NULL,
    description NVARCHAR(2000) NOT NULL,
    status NVARCHAR(20) DEFAULT 'ACTIVE',
    created_by NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_by NVARCHAR(100),
    updated_at DATETIME
);
GO
