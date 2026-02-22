CREATE DATABASE IF NOT EXISTS finance_auction_db;
USE finance_auction_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    finance_name VARCHAR(255),
    owner_name VARCHAR(255),
    role ENUM('admin', 'office', 'user') NOT NULL,
    status ENUM('pending', 'active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(255),
    starting_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bids Table
CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(15),
    state VARCHAR(50),
    city VARCHAR(50),
    subject VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, status)
VALUES ('admin', 'admin@autorevive.com', 'scrypt:32768:8:1$aimUYIYWlZ48vp1z$fde5b0003aa51add9a48c6dbbb0d182986a298791afc0056c7a19bd9b5c4bcee0fac5fe7f035c6a89d4ad85830d34c5b32df7f9f9597e05a8489a64812d43d70', 'admin', 'active')
ON DUPLICATE KEY UPDATE username=username;
