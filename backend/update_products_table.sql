-- Update products table to add new fields for vehicle specifications and bid end time
USE finance_auction_db;

-- Add new columns to products table (only columns that don't exist yet)
ALTER TABLE products ADD COLUMN bid_end_date DATETIME DEFAULT NULL COMMENT 'Auction end date and time';
ALTER TABLE products ADD COLUMN vehicle_year INT DEFAULT NULL COMMENT 'Manufacturing year';
ALTER TABLE products ADD COLUMN mileage INT DEFAULT NULL COMMENT 'Distance covered in KM';
ALTER TABLE products ADD COLUMN fuel_type VARCHAR(50) DEFAULT NULL COMMENT 'Petrol, Diesel, CNG, Electric';
ALTER TABLE products ADD COLUMN transmission VARCHAR(50) DEFAULT NULL COMMENT 'Manual, Automatic, AMT';
ALTER TABLE products ADD COLUMN owner_name VARCHAR(100) DEFAULT NULL COMMENT 'Previous owner name';
ALTER TABLE products ADD COLUMN registration_number VARCHAR(50) DEFAULT NULL COMMENT 'Vehicle registration number';
