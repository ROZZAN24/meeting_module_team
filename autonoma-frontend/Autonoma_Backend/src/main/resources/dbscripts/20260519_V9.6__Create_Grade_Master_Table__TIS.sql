-- Create hrm_grade_detail table for Grade Master
IF OBJECT_ID('hrm_grade_detail', 'U') IS NULL
BEGIN
    CREATE TABLE hrm_grade_detail (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        grade_code NVARCHAR(50),
        seq_no NVARCHAR(50),
        grade_name NVARCHAR(100),
        status NVARCHAR(20) DEFAULT 'Active',
        created_by NVARCHAR(100),
        created_at DATETIME DEFAULT GETDATE(),
        updated_by NVARCHAR(100),
        updated_at DATETIME
    );
END
GO

-- Seed hrm_grade_detail if empty
IF NOT EXISTS (SELECT * FROM hrm_grade_detail)
BEGIN
    INSERT INTO hrm_grade_detail (grade_code, seq_no, grade_name, status, created_by, created_at)
    VALUES
    ('G1', '1', 'Grade A', 'Active', 'SYSTEM', GETDATE()),
    ('G2', '2', 'Grade B', 'Active', 'SYSTEM', GETDATE()),
    ('G3', '3', 'Grade C', 'Active', 'SYSTEM', GETDATE()),
    ('G4', '4', 'Grade D', 'Active', 'SYSTEM', GETDATE());
END
GO
