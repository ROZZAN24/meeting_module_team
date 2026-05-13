-- V1.8 ADD CUSTOMER AND CONTACT MASTER TABLES
-- Supports both Customer and Contact management with file upload capabilities.

-- 1. SM CUSTOMER MASTER
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SM_CUSTOMER_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[SM_CUSTOMER_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [customer_code] NVARCHAR(50),
    [customer_name] NVARCHAR(200) NOT NULL,
    [invoice_name] NVARCHAR(200),
    [short_name] NVARCHAR(50),
    [segment] NVARCHAR(100),
    [sub_segment] NVARCHAR(100),
    [domain_name] NVARCHAR(150),
    [address] NVARCHAR(MAX),
    [pincode] NVARCHAR(20),
    [city] NVARCHAR(100),
    [state] NVARCHAR(100),
    [state_code] NVARCHAR(20),
    [country] NVARCHAR(100),
    [distance] NVARCHAR(50),
    [gstin] NVARCHAR(50),
    [vendor_code] NVARCHAR(50),
    [iso_number] NVARCHAR(50),
    [iso_expiry] NVARCHAR(50),
    [nda_required] NVARCHAR(10),
    [dispatch_mode] NVARCHAR(50),
    [currency] NVARCHAR(20),
    [payment_terms] NVARCHAR(100),
    [delivery_terms] NVARCHAR(100),
    [negotiate_customer] NVARCHAR(10),
    [daily_dispatch_mail] NVARCHAR(10),
    [file_upload] NVARCHAR(500),
    [status] NVARCHAR(50) DEFAULT 'Active',
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME
);
END

-- 2. SM CONTACT MASTER
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SM_CONTACT_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[SM_CONTACT_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [group_name] NVARCHAR(200),
    [title] NVARCHAR(20),
    [contact_name] NVARCHAR(200) NOT NULL,
    [designation] NVARCHAR(100),
    [department] NVARCHAR(100),
    [email_id] NVARCHAR(100),
    [landline_no] NVARCHAR(50),
    [mobile_no] NVARCHAR(50),
    [whatsapp_no] NVARCHAR(50),
    [file_upload] NVARCHAR(500),
    [status] NVARCHAR(50) DEFAULT 'Active',
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME
);
END
