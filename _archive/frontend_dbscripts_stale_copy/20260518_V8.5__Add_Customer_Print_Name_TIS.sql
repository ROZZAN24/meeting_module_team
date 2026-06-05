IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_customer_master') AND name = 'customer_print_name')
    ALTER TABLE sm_customer_master ADD customer_print_name VARCHAR(200);
