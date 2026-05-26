-- Expand prefix columns to 20 characters
ALTER TABLE ad_prefix_credentials ALTER COLUMN sales_order_prefix VARCHAR(20);
ALTER TABLE ad_prefix_credentials ALTER COLUMN mat_po_prefix VARCHAR(20);
ALTER TABLE ad_prefix_credentials ALTER COLUMN gate_entry_prefix VARCHAR(20);
ALTER TABLE ad_prefix_credentials ALTER COLUMN invoice_prefix VARCHAR(20);
