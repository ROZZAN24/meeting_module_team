-- Autonoma ERP Product Master Table & Seed Data
-- Standardized for SQL Server

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PRODUCT_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[PRODUCT_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [legacy_id] BIGINT,
    [category_id] BIGINT,
    [sub_category_id] BIGINT,
    [brand_id] BIGINT,
    [product_title] NVARCHAR(255),
    [product_slug] NVARCHAR(255),
    [product_desc] NVARCHAR(MAX),
    [product_features] NVARCHAR(MAX),
    [featured_image] NVARCHAR(255),
    [featured_image2] NVARCHAR(255),
    [size_chart] NVARCHAR(255),
    [product_mrp] DECIMAL(18, 2),
    [selling_price] DECIMAL(18, 2),
    [quantity] INT,
    [status] NVARCHAR(50) DEFAULT 'Active'
);
END

INSERT INTO PRODUCT_MASTER (legacy_id, category_id, sub_category_id, brand_id, product_title, product_slug, product_desc, product_features, featured_image, featured_image2, size_chart, product_mrp, selling_price, quantity, status) VALUES
(1, 1, 8, 1, 'Redmi Note 7S', 'redmi-note-7s-astro-moonlight', 'A professional smartphone with 48MP camera', '4GB RAM, 64GB ROM', 'img1.jpg', 'img2.jpg', '', 15000, 12000, 100, 'Active'),
(2, 1, 8, 3, 'Samsung Galaxy M30s', 'samsung-m30s-blue', 'Powerful 6000mAh battery smartphone', 'Super AMOLED Display', 'samsung1.jpg', 'samsung2.jpg', '', 18000, 15000, 50, 'Active');