-- Create employee_manager_mapping table
IF OBJECT_ID('employee_manager_mapping', 'U') IS NULL
BEGIN
    CREATE TABLE employee_manager_mapping (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        emp_id BIGINT NOT NULL,
        home_manager_id BIGINT NULL,
        business_manager_id BIGINT NULL,
        vertical_head_id BIGINT NULL,
        hr_id BIGINT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL,
        status NVARCHAR(50) NULL DEFAULT 'Active',
        CONSTRAINT FK_EmpMapping_Emp FOREIGN KEY (emp_id) REFERENCES hrm_employee_master(id),
        CONSTRAINT FK_EmpMapping_Home FOREIGN KEY (home_manager_id) REFERENCES hrm_employee_master(id),
        CONSTRAINT FK_EmpMapping_Business FOREIGN KEY (business_manager_id) REFERENCES hrm_employee_master(id),
        CONSTRAINT FK_EmpMapping_Vertical FOREIGN KEY (vertical_head_id) REFERENCES hrm_employee_master(id),
        CONSTRAINT FK_EmpMapping_HR FOREIGN KEY (hr_id) REFERENCES hrm_employee_master(id)
    );
    CREATE INDEX IX_EmpMapping_Emp ON employee_manager_mapping(emp_id);
END
GO
