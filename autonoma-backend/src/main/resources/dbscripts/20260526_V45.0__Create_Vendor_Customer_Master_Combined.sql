-- ============================================================
-- Migration: Create Combined sm_vendor_customer_master Table
-- Merges: sm_customer_master + sm_supplier_master
-- record_type = 'CUSTOMER' | 'VENDOR'
-- ============================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sm_vendor_customer_master' AND xtype='U')
BEGIN
    CREATE TABLE sm_vendor_customer_master (
        id                  BIGINT IDENTITY(1,1) PRIMARY KEY,

        -- *** Identifier: distinguishes CUSTOMER vs VENDOR ***
        record_type         NVARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',  -- 'CUSTOMER' or 'VENDOR'

        -- *** Common Code field ***
        code                NVARCHAR(50)  NULL,   -- customer_code / supplier_code

        -- *** Names ***
        name                NVARCHAR(200) NULL,   -- customer_name / supplier_name
        print_name          NVARCHAR(200) NULL,   -- customer_print_name / supplier_print_name
        short_name          NVARCHAR(50)  NULL,
        ledger_name         NVARCHAR(200) NULL,   -- accounts_ledger / ledger_name
        invoice_name        NVARCHAR(200) NULL,   -- customer only
        group_name          NVARCHAR(200) NULL,   -- customer only

        -- *** Address ***
        address             NVARCHAR(MAX) NULL,
        pincode             NVARCHAR(20)  NULL,
        city                NVARCHAR(100) NULL,
        state               NVARCHAR(100) NULL,
        state_code          NVARCHAR(20)  NULL,   -- customer only
        country             NVARCHAR(100) NULL,
        location            NVARCHAR(200) NULL,   -- customer only
        distance            NVARCHAR(50)  NULL,   -- customer only

        -- *** Contact ***
        contact_person      NVARCHAR(100) NULL,   -- vendor only
        mobile_no           NVARCHAR(20)  NULL,   -- vendor only
        email_id            NVARCHAR(100) NULL,   -- vendor only
        website             NVARCHAR(150) NULL,

        -- *** Tax & Registration ***
        gst_no              NVARCHAR(50)  NULL,   -- gstin / GST_NO
        pan_no              NVARCHAR(50)  NULL,
        pan_file_info       NVARCHAR(1000) NULL,
        register_no         NVARCHAR(100) NULL,   -- customer only
        cin_no              NVARCHAR(100) NULL,   -- customer only
        vendor_code         NVARCHAR(50)  NULL,   -- customer only (cross-ref)

        -- *** MSME (vendor only) ***
        msme_no             NVARCHAR(50)  NULL,
        msme_file_info      NVARCHAR(1000) NULL,

        -- *** ISO ***
        iso_no              NVARCHAR(50)  NULL,
        iso_file_info       NVARCHAR(1000) NULL,
        iso_expiry_date     NVARCHAR(50)  NULL,

        -- *** Flags ***
        prime_flag          NVARCHAR(10)  NULL,   -- prime_customer / PRIME_SUPPLIER
        approved_supplier   NVARCHAR(10)  NULL,   -- vendor only
        nda_required        NVARCHAR(10)  NULL,
        is_auditor_consultant NVARCHAR(10) NULL,  -- vendor only
        segment             NVARCHAR(100) NULL,   -- customer only
        sub_segment         NVARCHAR(100) NULL,   -- customer only
        domain_name         NVARCHAR(150) NULL,   -- customer only
        negotiate_customer  NVARCHAR(10)  NULL,   -- customer only
        daily_dispatch_mail NVARCHAR(10)  NULL,   -- customer only
        ld_applicable       NVARCHAR(10)  NULL,   -- customer only

        -- *** Trade Terms ***
        currency            NVARCHAR(20)  NULL,
        payment_terms       NVARCHAR(100) NULL,
        delivery_terms      NVARCHAR(100) NULL,
        freight             NVARCHAR(100) NULL,   -- freight / FREIGHT_REQUIRED
        dispatch_mode       NVARCHAR(50)  NULL,   -- customer only
        type_of_service     NVARCHAR(100) NULL,   -- vendor only
        due_days            NVARCHAR(20)  NULL,   -- vendor only

        -- *** Bank Details (vendor only) ***
        account_no          NVARCHAR(50)  NULL,
        account_name        NVARCHAR(100) NULL,
        bank_name           NVARCHAR(100) NULL,
        branch_name         NVARCHAR(100) NULL,
        ifsc_code           NVARCHAR(50)  NULL,
        swift_code          NVARCHAR(50)  NULL,
        account_type        NVARCHAR(50)  NULL,

        -- *** Files ***
        upload_files        NVARCHAR(2000) NULL,

        -- *** Audit ***
        status              NVARCHAR(20)  NULL DEFAULT 'Active',
        created_by          NVARCHAR(100) NULL,
        created_at          DATETIME2     NULL DEFAULT GETDATE(),
        updated_by          NVARCHAR(100) NULL,
        updated_at          DATETIME2     NULL
    );
    PRINT 'Table sm_vendor_customer_master created.';
END
ELSE
BEGIN
    PRINT 'Table sm_vendor_customer_master already exists. Skipping creation.';
END
GO

-- ============================================================
-- MIGRATE DATA: sm_customer_master  ->  sm_vendor_customer_master
-- ============================================================
SET IDENTITY_INSERT sm_vendor_customer_master ON;

INSERT INTO sm_vendor_customer_master (
    id, record_type, code, name, print_name, short_name,
    ledger_name, invoice_name, group_name,
    address, pincode, city, state, state_code, country, location, distance,
    website, gst_no, pan_no, pan_file_info, register_no, cin_no, vendor_code,
    iso_no, iso_expiry_date, prime_flag, nda_required,
    segment, sub_segment, domain_name, negotiate_customer, daily_dispatch_mail, ld_applicable,
    currency, payment_terms, delivery_terms, freight, dispatch_mode,
    upload_files, status, created_by, created_at, updated_by, updated_at
)
SELECT
    id,
    'CUSTOMER'          AS record_type,
    customer_code       AS code,
    customer_name       AS name,
    customer_print_name AS print_name,
    short_name,
    accounts_ledger     AS ledger_name,
    invoice_name,
    group_name,
    address, pincode, city, state, state_code, country, location, distance,
    website,
    gstin               AS gst_no,
    pan_no, pan_file_info,
    register_no, cin_no, vendor_code,
    iso_number          AS iso_no,
    iso_expiry          AS iso_expiry_date,
    prime_customer      AS prime_flag,
    nda_required,
    segment, sub_segment, domain_name, negotiate_customer, daily_dispatch_mail, ld_applicable,
    currency, payment_terms, delivery_terms, freight, dispatch_mode,
    file_upload         AS upload_files,
    status, created_by, created_at, updated_by, updated_at
FROM sm_customer_master
WHERE id NOT IN (
    SELECT id FROM sm_vendor_customer_master WHERE record_type = 'CUSTOMER'
);

SET IDENTITY_INSERT sm_vendor_customer_master OFF;
PRINT 'Customer records migrated to sm_vendor_customer_master.';
GO

-- ============================================================
-- MIGRATE DATA: sm_supplier_master  ->  sm_vendor_customer_master
-- (IDs offset by 1000000 to avoid PK clash with customer IDs)
-- ============================================================
INSERT INTO sm_vendor_customer_master (
    record_type, code, name, print_name, short_name, ledger_name,
    address, pincode, city, state, country,
    contact_person, mobile_no, email_id, website,
    gst_no, pan_no, pan_file_info,
    msme_no, msme_file_info, iso_no, iso_file_info, iso_expiry_date,
    approved_supplier, prime_flag, nda_required, is_auditor_consultant,
    currency, payment_terms, delivery_terms, freight, type_of_service, due_days,
    account_no, account_name, bank_name, branch_name, ifsc_code, swift_code, account_type,
    upload_files, status, created_by, created_at, updated_by, updated_at
)
SELECT
    'VENDOR'            AS record_type,
    SUPPLIER_CODE       AS code,
    SUPPLIER_NAME       AS name,
    SUPPLIER_PRINT_NAME AS print_name,
    SHORT_NAME,
    LEDGER_NAME,
    ADDRESS, PINCODE, CITY, STATE, COUNTRY,
    CONTACT_PERSON, MOBILE_NO, EMAIL_ID, WEBSITE,
    GST_NO, PAN_NO, pan_file_info,
    MSME_NO, msme_file_info, ISO_NO, iso_file_info, ISO_EXPIRY_DATE,
    APPROVED_SUPPLIER,
    PRIME_SUPPLIER      AS prime_flag,
    NDA_REQUIRED, IS_AUDITOR_CONSULTANT,
    CURRENCY, PAYMENT_TERMS, DELIVERY_TERMS,
    FREIGHT_REQUIRED    AS freight,
    TYPE_OF_SERVICE, DUE_DAYS,
    ACCOUNT_NO, ACCOUNT_NAME, BANK_NAME, BRANCH_NAME, IFSC_CODE, SWIFT_CODE, ACCOUNT_TYPE,
    UPLOAD_FILES, STATUS, created_by, created_at, updated_by, updated_at
FROM sm_supplier_master;

PRINT 'Vendor records migrated to sm_vendor_customer_master.';
GO

-- ============================================================
-- VERIFY: Show counts
-- ============================================================
SELECT record_type, COUNT(*) AS total_records
FROM sm_vendor_customer_master
GROUP BY record_type;
GO
