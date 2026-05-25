-- V12.2__Create_Induction_Assignment.sql
-- Table to manage employee induction assignments and schedules

DROP TABLE IF EXISTS hr_induction_assignment;
CREATE TABLE hr_induction_assignment (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    emp_code NVARCHAR(50) NOT NULL,
    emp_name NVARCHAR(255) NOT NULL,
    old_emp_code NVARCHAR(50),
    department NVARCHAR(100),
    designation NVARCHAR(100),
    induction_round NVARCHAR(50) NOT NULL, -- HR, QMS, DEPARTMENT, MANAGEMENT
    screening_level NVARCHAR(50) NOT NULL, -- Level 1, 2, 3, 4
    induction_date DATE NOT NULL,
    induction_time NVARCHAR(20) NOT NULL,
    trainer_name NVARCHAR(255) NOT NULL, -- Induction Person
    current_status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, RESCHEDULE, TRAINING GIVEN, COMPLETED
    induction_status NVARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, IN ACTIVE (for history/reschedule logic)
    remarks NVARCHAR(1000),
    
    -- Audit Fields
    created_by NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_by NVARCHAR(100),
    updated_at DATETIME,
    
    -- Constraints
    CONSTRAINT FK_InductionAssignment_Employee FOREIGN KEY (emp_code) REFERENCES hrm_employee_master(emp_code)
);

CREATE INDEX IX_InductionAssignment_Emp ON hr_induction_assignment(emp_code);
CREATE INDEX IX_InductionAssignment_Status ON hr_induction_assignment(current_status);
