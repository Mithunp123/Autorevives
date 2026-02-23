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
    state VARCHAR(100) DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
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

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    period VARCHAR(50) NOT NULL,
    features TEXT,
    popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO plans (name, price, duration, period, features, popular, sort_order) VALUES
('Basic', 499, '30 Days', '30 Days', '["Access all auctions","Real-time bidding","Email notifications","Standard support"]', FALSE, 1),
('Professional', 2799, '180 Days', '180 Days', '["Everything in Basic","Priority bidding queue","SMS & WhatsApp alerts","Dedicated manager","Early access"]', TRUE, 2),
('Enterprise', 4999, '365 Days', '365 Days', '["Everything in Pro","Unlimited bids","Analytics dashboard","24/7 priority support","API access"]', FALSE, 3)
ON DUPLICATE KEY UPDATE name=name;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, status)
VALUES ('admin', 'admin@autorevive.com', 'scrypt:32768:8:1$aimUYIYWlZ48vp1z$fde5b0003aa51add9a48c6dbbb0d182986a298791afc0056c7a19bd9b5c4bcee0fac5fe7f035c6a89d4ad85830d34c5b32df7f9f9597e05a8489a64812d43d70', 'admin', 'active')
ON DUPLICATE KEY UPDATE username=username;
