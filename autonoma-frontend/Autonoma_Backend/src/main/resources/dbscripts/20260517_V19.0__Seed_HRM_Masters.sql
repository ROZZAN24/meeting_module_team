-- Seed hrm_designation_level if empty
IF NOT EXISTS (SELECT * FROM hrm_designation_level)
BEGIN
    INSERT INTO hrm_designation_level (level, basic, da, hra, screening_level, created_by, created_at)
    VALUES 
    ('L1', 15000.0, 3000.0, 4500.0, 1, 'SYSTEM', GETDATE()),
    ('L2', 25000.0, 5000.0, 7500.0, 2, 'SYSTEM', GETDATE()),
    ('L3', 40000.0, 8000.0, 12000.0, 3, 'SYSTEM', GETDATE()),
    ('L4', 60000.0, 12000.0, 18000.0, 4, 'SYSTEM', GETDATE()),
    ('L5', 90000.0, 18000.0, 27000.0, 5, 'SYSTEM', GETDATE());
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

-- Seed hrm_department_master if empty
IF NOT EXISTS (SELECT * FROM hrm_department_master)
BEGIN
    INSERT INTO hrm_department_master (dept_no, dept_name, nda_certificate, seq_no, status, created_by, created_at)
    VALUES
    ('DEPT-001', 'Human Resources', 'No', 1, 'Active', 'SYSTEM', GETDATE()),
    ('DEPT-002', 'Information Technology', 'No', 2, 'Active', 'SYSTEM', GETDATE()),
    ('DEPT-003', 'Sales & Marketing', 'No', 3, 'Active', 'SYSTEM', GETDATE()),
    ('DEPT-004', 'Finance & Accounts', 'No', 4, 'Active', 'SYSTEM', GETDATE()),
    ('DEPT-005', 'Quality Management', 'No', 5, 'Active', 'SYSTEM', GETDATE());
END
GO
