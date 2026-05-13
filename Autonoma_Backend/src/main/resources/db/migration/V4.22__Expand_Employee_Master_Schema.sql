-- Migration to expand hrm_employee_master with all requested fields safely
IF OBJECT_ID('tempdb..#AddCol') IS NOT NULL DROP PROCEDURE #AddCol;
GO
CREATE PROCEDURE #AddCol @tableName NVARCHAR(100), @colName NVARCHAR(100), @colDef NVARCHAR(MAX)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@colName) AND name = @colName) -- Wait, OBJECT_ID(@colName) is wrong
    BEGIN
        -- Corrected check
        IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @colName)
        BEGIN
            DECLARE @sql NVARCHAR(MAX) = 'ALTER TABLE ' + @tableName + ' ADD [' + @colName + '] ' + @colDef;
            EXEC sp_executesql @sql;
        END
    END
END
GO

-- Classification & Identity
EXEC #AddCol 'hrm_employee_master', 'employee_photo_upload', 'VARCHAR(MAX)';
EXEC #AddCol 'hrm_employee_master', 'employee_signature_upload', 'VARCHAR(MAX)';
EXEC #AddCol 'hrm_employee_master', 'nda_upload', 'VARCHAR(MAX)';
EXEC #AddCol 'hrm_employee_master', 'fitness_certificate_upload', 'VARCHAR(MAX)';

-- Organization
EXEC #AddCol 'hrm_employee_master', 'vertical_head', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'hr_manager', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'office_mail', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'office_mail_password', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'pf_toggle', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'esi_toggle', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'p_tax_toggle', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'bonus_toggle', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'ot_toggle', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'ot_factorial', 'DECIMAL(10,2)';
EXEC #AddCol 'hrm_employee_master', 'lom_deduction', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'lom_allow', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'lta_eligible', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'pf_restriction', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'permission_toggle', 'VARCHAR(10) DEFAULT ''NO''';
EXEC #AddCol 'hrm_employee_master', 'permission_limit', 'DECIMAL(10,2)';
EXEC #AddCol 'hrm_employee_master', 'vendor_name', 'VARCHAR(200)';

-- Personal Details
EXEC #AddCol 'hrm_employee_master', 'gender', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'marital_status', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'married_date', 'DATE';
EXEC #AddCol 'hrm_employee_master', 'dob', 'DATE';
EXEC #AddCol 'hrm_employee_master', 'personal_email', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'blood_group', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'region_id', 'BIGINT';
EXEC #AddCol 'hrm_employee_master', 'shirt_size', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'pant_size', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'shoe_size', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'height', 'DECIMAL(10,2)';
EXEC #AddCol 'hrm_employee_master', 'weight', 'DECIMAL(10,2)';

-- Address Details (Communication)
EXEC #AddCol 'hrm_employee_master', 'comm_address', 'VARCHAR(MAX)';
EXEC #AddCol 'hrm_employee_master', 'comm_city', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'comm_state', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'comm_country', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'comm_pincode', 'VARCHAR(50)';

-- Permanent Address
EXEC #AddCol 'hrm_employee_master', 'perm_address', 'VARCHAR(MAX)';
EXEC #AddCol 'hrm_employee_master', 'perm_city', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'perm_state', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'perm_country', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'perm_pincode', 'VARCHAR(50)';

-- ID Details
EXEC #AddCol 'hrm_employee_master', 'aadhar_no', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'driving_license_no', 'VARCHAR(100)';
EXEC #AddCol 'hrm_employee_master', 'passport_no', 'VARCHAR(100)';
EXEC #AddCol 'hrm_employee_master', 'place_of_issue', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'passport_expiry_date', 'DATE';
EXEC #AddCol 'hrm_employee_master', 'loan_installment_amount', 'DECIMAL(18,2)';

-- Statutory
EXEC #AddCol 'hrm_employee_master', 'pan_no', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'pf_no', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'uan_no', 'VARCHAR(50)';

-- Bank Details
EXEC #AddCol 'hrm_employee_master', 'account_no', 'VARCHAR(100)';
EXEC #AddCol 'hrm_employee_master', 'account_name', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'branch_name', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'bank_account_type', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'bank_name', 'VARCHAR(200)';
EXEC #AddCol 'hrm_employee_master', 'ifsc_code', 'VARCHAR(50)';

-- Pay Component
EXEC #AddCol 'hrm_employee_master', 'gross_salary', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'net_salary', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'basic_salary_comp', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'da_comp', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'hra_comp', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'special_allowance_comp', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'performance_incentive_comp', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'canteen_deduction', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'pf_type', 'VARCHAR(50)';
EXEC #AddCol 'hrm_employee_master', 'pf_employee_comp', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'esi_employee_comp', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'professional_tax_comp', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'upload_pf_document', 'VARCHAR(MAX)';

-- CTC Details
EXEC #AddCol 'hrm_employee_master', 'monthly_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'basic_salary_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'da_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'special_allowance_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'canteen_allowance_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'performance_incentive_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'esi_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'pf_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'gross_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'employer_contribution_pf', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'employer_contribution_esi', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'uniform_allowance', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'shoe_allowance', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'mobile_allowance_cug', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'annual_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'salary_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'gratuity_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'bonus_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'special_incentive_ctc', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'performance_linked_incentive', 'DECIMAL(18,2)';
EXEC #AddCol 'hrm_employee_master', 'health_insurance', 'DECIMAL(18,2)';

DROP PROCEDURE #AddCol;
GO
