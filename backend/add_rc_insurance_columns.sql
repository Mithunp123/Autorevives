-- Add RC and Insurance columns to products table
USE finance_auction_db;

-- RC (Registration Certificate) availability
ALTER TABLE products ADD COLUMN rc_available BOOLEAN DEFAULT FALSE COMMENT 'Whether RC is available';
ALTER TABLE products ADD COLUMN rc_image VARCHAR(500) DEFAULT NULL COMMENT 'RC document image path';

-- Insurance availability
ALTER TABLE products ADD COLUMN insurance_available BOOLEAN DEFAULT FALSE COMMENT 'Whether insurance is available';
ALTER TABLE products ADD COLUMN insurance_image VARCHAR(500) DEFAULT NULL COMMENT 'Insurance document image path';

-- Update image_path column to support longer JSON arrays
ALTER TABLE products MODIFY COLUMN image_path TEXT DEFAULT NULL;
