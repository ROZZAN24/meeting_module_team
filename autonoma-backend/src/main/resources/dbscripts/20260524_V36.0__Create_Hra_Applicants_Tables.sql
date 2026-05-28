-- 20260524_V36.0__Create_Hra_Applicants_Tables.sql

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'hra_applicants')
BEGIN
    CREATE TABLE hra_applicants (
        id INT IDENTITY(1,1) PRIMARY KEY,
        en_rolled_no VARCHAR(50) NOT NULL UNIQUE,
        applicant_date DATE NOT NULL,
        position_look_for VARCHAR(100) NOT NULL,
        title VARCHAR(10) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        mobile_no VARCHAR(20) NOT NULL,
        email_id VARCHAR(100) NOT NULL,
        aadhar_no VARCHAR(20) NOT NULL,
        birth_date DATE NOT NULL,
        age INT,
        duplicate_aadhar BIT DEFAULT 0,
        ref_mode VARCHAR(50),
        ref_comments NVARCHAR(MAX),
        call_status VARCHAR(20) DEFAULT 'PENDING',
        interview_status VARCHAR(20) DEFAULT 'PENDING',
        offer_status VARCHAR(20) DEFAULT 'PENDING',
        verification_status VARCHAR(20) DEFAULT 'PENDING',
        status VARCHAR(50) DEFAULT 'APPLIED',
        
        -- Personal details (Tab 1)
        gender VARCHAR(20),
        marital_status VARCHAR(20),
        pan_no VARCHAR(20),
        office_phone_no VARCHAR(20),
        phone_no VARCHAR(20),
        religion VARCHAR(50),
        nationality VARCHAR(50),
        perm_add1 NVARCHAR(255),
        perm_add2 NVARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        same_as_permanent BIT DEFAULT 0,
        pers_add1 NVARCHAR(255),
        pers_add2 NVARCHAR(255),
        
        -- Salary Details (Tab 4)
        basic DECIMAL(18,2) DEFAULT 0.0,
        da DECIMAL(18,2) DEFAULT 0.0,
        hra DECIMAL(18,2) DEFAULT 0.0,
        spl_allowance DECIMAL(18,2) DEFAULT 0.0,
        perf_incentive DECIMAL(18,2) DEFAULT 0.0,
        statutory_bonus DECIMAL(18,2) DEFAULT 0.0,
        canteen_allowance DECIMAL(18,2) DEFAULT 0.0,
        attendance_allow1 DECIMAL(18,2) DEFAULT 0.0,
        attendance_allow2 DECIMAL(18,2) DEFAULT 0.0,
        uniform DECIMAL(18,2) DEFAULT 0.0,
        shoes DECIMAL(18,2) DEFAULT 0.0,
        mobile_cug DECIMAL(18,2) DEFAULT 0.0,
        ot_amount DECIMAL(18,2) DEFAULT 0.0,
        petrol_allow DECIMAL(18,2) DEFAULT 0.0,
        appraisal_per DECIMAL(18,2) DEFAULT 0.0,
        other_allow DECIMAL(18,2) DEFAULT 0.0,
        pf_employee DECIMAL(18,2) DEFAULT 0.0,
        pf_employer DECIMAL(18,2) DEFAULT 0.0,
        esi_employee DECIMAL(18,2) DEFAULT 0.0,
        esi_employer DECIMAL(18,2) DEFAULT 0.0,
        canteen_deduct DECIMAL(18,2) DEFAULT 0.0,
        prof_tax DECIMAL(18,2) DEFAULT 0.0,
        labour_wel_fund_emp DECIMAL(18,2) DEFAULT 0.0,
        labour_wel_fund_employer DECIMAL(18,2) DEFAULT 0.0,
        other_deduct DECIMAL(18,2) DEFAULT 0.0,
        suspense_deduct DECIMAL(18,2) DEFAULT 0.0,
        gross_salary DECIMAL(18,2) DEFAULT 0.0,
        net_salary DECIMAL(18,2) DEFAULT 0.0,
        ctc DECIMAL(18,2) DEFAULT 0.0,
        
        -- Evaluation Details (Tab 5)
        interview_date DATE,
        evaluation_status VARCHAR(20),
        evaluation_comments NVARCHAR(MAX),
        technical_interviewed_by VARCHAR(100),
        hr_interviewed_by VARCHAR(100),
        
        -- Contact Details (Tab 6)
        contact_address1 NVARCHAR(255),
        contact_address2 NVARCHAR(255),
        contact_city VARCHAR(100),
        contact_phone VARCHAR(20),
        contact_mobile VARCHAR(20),
        
        -- Self Assessment (Tab 8)
        q1_native NVARCHAR(255),
        q2_present_address NVARCHAR(MAX),
        q3_permanent_address NVARCHAR(MAX),
        q4_father_occupation NVARCHAR(255),
        q5_mother_occupation NVARCHAR(255),
        q6_marital_status VARCHAR(50),
        q7_spouse_occupation NVARCHAR(255),
        q8_children NVARCHAR(255),
        q9_has_relatives VARCHAR(10),
        q10_relatives_details NVARCHAR(MAX),
        q11_siblings_occupations NVARCHAR(MAX),
        q12_has_two_wheeler VARCHAR(10),
        q13_has_android_phone VARCHAR(10),
        q14_knows_car_driving VARCHAR(10),
        q15_willing_to_travel VARCHAR(10),
        q16_covid_vaccination VARCHAR(10),
        q17_positive_points NVARCHAR(MAX),
        q18_negative_points NVARCHAR(MAX),
        q19_life_goals NVARCHAR(MAX),
        q20_improvement_suggestions NVARCHAR(MAX),
        q21_is_experienced VARCHAR(10),
        q22_total_experience VARCHAR(50),
        q23_core_experience VARCHAR(50),
        q24_prev_net_salary VARCHAR(50),
        q25_prev_gross_salary VARCHAR(50),
        q26_expected_net_salary VARCHAR(50),
        q27_expected_gross_salary VARCHAR(50),
        q28_pf_higher_pension VARCHAR(10),
        q29_pf_deduction_amount VARCHAR(50),
        q30_alternative_department VARCHAR(100),
        q31_prev_location NVARCHAR(255),
        q32_prev_shift VARCHAR(50),
        q33_reason_for_leaving NVARCHAR(MAX),
        q34_notice_period VARCHAR(50),
        q35_prev_dept_position NVARCHAR(255),
        q36_prev_dept_count VARCHAR(50),
        q37_prev_reporting_to NVARCHAR(255),
        q38_handle_mistake NVARCHAR(MAX),
        q39_handle_opinion_difference NVARCHAR(MAX),
        q40_computer_self_rating VARCHAR(50),
        payslip_path NVARCHAR(MAX),
        
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME
    );
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'hra_applicant_experience')
BEGIN
    CREATE TABLE hra_applicant_experience (
        id INT IDENTITY(1,1) PRIMARY KEY,
        applicant_id INT NOT NULL FOREIGN KEY REFERENCES hra_applicants(id) ON DELETE CASCADE,
        sl_no INT,
        company_name NVARCHAR(255),
        location NVARCHAR(255),
        from_date DATE,
        to_date DATE,
        exp_years VARCHAR(50),
        file_path NVARCHAR(MAX)
    );
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'hra_applicant_education')
BEGIN
    CREATE TABLE hra_applicant_education (
        id INT IDENTITY(1,1) PRIMARY KEY,
        applicant_id INT NOT NULL FOREIGN KEY REFERENCES hra_applicants(id) ON DELETE CASCADE,
        sl_no INT,
        education NVARCHAR(255),
        institution_name NVARCHAR(255),
        type VARCHAR(50),
        year_of_passing VARCHAR(10),
        grade VARCHAR(50),
        file_path NVARCHAR(MAX)
    );
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'hra_applicant_kyc')
BEGIN
    CREATE TABLE hra_applicant_kyc (
        id INT IDENTITY(1,1) PRIMARY KEY,
        applicant_id INT NOT NULL FOREIGN KEY REFERENCES hra_applicants(id) ON DELETE CASCADE,
        sl_no INT,
        seq_no VARCHAR(50),
        doc_name NVARCHAR(255),
        doc_no VARCHAR(100),
        file_path NVARCHAR(MAX)
    );
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'hra_applicant_skills')
BEGIN
    CREATE TABLE hra_applicant_skills (
        id INT IDENTITY(1,1) PRIMARY KEY,
        applicant_id INT NOT NULL FOREIGN KEY REFERENCES hra_applicants(id) ON DELETE CASCADE,
        sl_no INT,
        activity_details NVARCHAR(MAX),
        file_path NVARCHAR(MAX)
    );
END
