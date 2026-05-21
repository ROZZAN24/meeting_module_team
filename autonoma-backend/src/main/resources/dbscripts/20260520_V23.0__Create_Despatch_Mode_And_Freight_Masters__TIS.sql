-- Create mode_of_despatch table if not exists
IF OBJECT_ID('mode_of_despatch', 'U') IS NULL
BEGIN
    CREATE TABLE mode_of_despatch (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        mode_name NVARCHAR(100) NOT NULL,
        description NVARCHAR(MAX) NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'Active',
        created_by NVARCHAR(255) NULL,
        created_date DATETIME NULL,
        updated_by NVARCHAR(255) NULL,
        updated_date DATETIME NULL
    );
END
GO

-- Create freight_master table if not exists
IF OBJECT_ID('freight_master', 'U') IS NULL
BEGIN
    CREATE TABLE freight_master (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        freight_type NVARCHAR(100) NOT NULL,
        description NVARCHAR(MAX) NULL,
        status NVARCHAR(50) NOT NULL DEFAULT 'Active',
        created_by NVARCHAR(255) NULL,
        created_date DATETIME NULL,
        updated_by NVARCHAR(255) NULL,
        updated_date DATETIME NULL
    );
END
GO
