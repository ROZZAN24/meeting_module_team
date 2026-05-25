IF OBJECT_ID('ad_prefix_credentials', 'U') IS NULL
BEGIN
    CREATE TABLE ad_prefix_credentials (
        account_year VARCHAR(20) PRIMARY KEY,
        status INT DEFAULT 1,
        sales_order_prefix VARCHAR(10),
        mat_po_prefix VARCHAR(10),
        gate_entry_prefix VARCHAR(10),
        invoice_prefix VARCHAR(10),
        created_by NVARCHAR(100),
        created_at DATETIME,
        updated_by NVARCHAR(100),
        updated_at DATETIME
    );
END
