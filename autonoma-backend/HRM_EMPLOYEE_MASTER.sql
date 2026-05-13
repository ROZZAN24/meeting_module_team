CREATE TABLE HRM_EMPLOYEE_MASTER (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    
    -- Mandatory fields
    category_id BIGINT NOT NULL,
    emp_level_id BIGINT NOT NULL,
    employee_type_id BIGINT NOT NULL,
    title VARCHAR(10) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    father_husband_name VARCHAR(100) NOT NULL,
    emp_code VARCHAR(50) NOT NULL UNIQUE,
    
    -- Optional fields
    department_id BIGINT,
    designation_id BIGINT,
    date_of_joining DATE,
    confirmation_date DATE,
    unit_id BIGINT,
    refer_mode VARCHAR(50),
    profile_upload VARCHAR(255),
    signature VARCHAR(255),
    
    -- Audit fields
    status VARCHAR(20) DEFAULT 'Active',
    created_by VARCHAR(100),
    created_date DATETIME DEFAULT GETDATE(),
    updated_by VARCHAR(100),
    updated_date DATETIME
);
