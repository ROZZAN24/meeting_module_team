import sys

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Normalize line endings to avoid match failure
    content = content.replace('\r\n', '\n')

    tables = [
        ('AD_COMPANY_CREDENTIAL', 'comp_pk'),
        ('AD_DIVISION', 'div_pk'),
        ('AD_USER_COMPANY_MAPPING', 'uc_pk'),
        ('AD_USER_DIVISION_MAPPING', 'ud_pk'),
        ('AD_USER_SESSION_AUDIT', 'usa_pk'),
        ('AD_USER_SESSION_ACTIVITY', 'usact_pk')
    ]

    for table, pk_var in tables:
        target = f"""IF OBJECT_ID('{table}', 'U') IS NOT NULL
BEGIN
    DECLARE @{pk_var} NVARCHAR(256);
    SELECT TOP 1 @{pk_var} = name 
    FROM sys.key_constraints 
    WHERE parent_object_id = OBJECT_ID('{table}') AND type = 'PK';
    
    IF @{pk_var} IS NOT NULL AND @{pk_var} <> 'PK_{table}'
    BEGIN
        DECLARE @drop_{pk_var} NVARCHAR(MAX) = 'ALTER TABLE {table} DROP CONSTRAINT ' + @{pk_var};
        EXEC(@drop_{pk_var});
    END
    
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('{table}') AND name = 'PK_{table}')
    BEGIN
        ALTER TABLE {table} ALTER COLUMN id BIGINT NOT NULL;
        ALTER TABLE {table} ADD CONSTRAINT PK_{table} PRIMARY KEY (id);
    END
END
GO"""

        replacement = f"""IF OBJECT_ID('{table}', 'U') IS NOT NULL
BEGIN
    DECLARE @{pk_var} NVARCHAR(256);
    SELECT TOP 1 @{pk_var} = name 
    FROM sys.key_constraints 
    WHERE parent_object_id = OBJECT_ID('{table}') AND type = 'PK';
    
    IF @{pk_var} IS NOT NULL AND @{pk_var} <> 'PK_{table}'
    BEGIN
        DECLARE @drop_{pk_var} NVARCHAR(MAX) = 'ALTER TABLE {table} DROP CONSTRAINT ' + @{pk_var};
        EXEC(@drop_{pk_var});
    END
END
GO

IF OBJECT_ID('{table}', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('{table}') AND name = 'PK_{table}')
    BEGIN
        ALTER TABLE {table} ALTER COLUMN id BIGINT NOT NULL;
    END
END
GO

IF OBJECT_ID('{table}', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('{table}') AND name = 'PK_{table}')
    BEGIN
        ALTER TABLE {table} ADD CONSTRAINT PK_{table} PRIMARY KEY (id);
    END
END
GO"""

        target = target.replace('\r\n', '\n')
        replacement = replacement.replace('\r\n', '\n')
        
        if target in content:
            content = content.replace(target, replacement)
        else:
            print(f"Target not found for table {table}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed: {file_path}")

if __name__ == '__main__':
    fix_file(sys.argv[1])
