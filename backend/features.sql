-- ─────────────────────────────────────────────────────────────────────────────
-- AutoRevive — Features SQL Reference
-- Run this to create all feature tables from scratch.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlists (
    user_id INT PRIMARY KEY,
    items JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status ENUM('won', 'completed', 'cancelled') DEFAULT 'won',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Error Logs — rich device + browser fingerprint table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT DEFAULT NULL,
    username        VARCHAR(100) DEFAULT NULL,

    -- Error details
    error_type      VARCHAR(50)   DEFAULT 'frontend',
    error_message   TEXT,
    error_stack     TEXT,
    component_name  VARCHAR(255)  DEFAULT NULL,

    -- Page context
    page_url        VARCHAR(1000) DEFAULT NULL,
    page_title      VARCHAR(500)  DEFAULT NULL,
    referrer_url    VARCHAR(1000) DEFAULT NULL,

    -- Device info (sent by the client browser)
    device_type     VARCHAR(50)  DEFAULT NULL,   -- 'Mobile' | 'Tablet' | 'Desktop'
    device_model    VARCHAR(255) DEFAULT NULL,   -- e.g. 'iPhone', 'Samsung SM-G991B'
    os_name         VARCHAR(100) DEFAULT NULL,   -- 'Android', 'iOS', 'Windows', 'macOS'
    os_version      VARCHAR(100) DEFAULT NULL,   -- e.g. '14.6', '10'
    browser_name    VARCHAR(100) DEFAULT NULL,   -- 'Chrome', 'Safari', 'Firefox'
    browser_version VARCHAR(100) DEFAULT NULL,   -- e.g. '121.0.6167.85'
    user_agent      TEXT         DEFAULT NULL,   -- full UA string

    -- Screen & locale
    screen_width    SMALLINT     DEFAULT NULL,   -- physical screen px
    screen_height   SMALLINT     DEFAULT NULL,
    viewport_width  SMALLINT     DEFAULT NULL,   -- browser window px
    viewport_height SMALLINT     DEFAULT NULL,
    language        VARCHAR(20)  DEFAULT NULL,   -- e.g. 'en-IN'
    timezone        VARCHAR(100) DEFAULT NULL,   -- e.g. 'Asia/Kolkata'

    -- Network & versioning
    ip_address      VARCHAR(45)  DEFAULT NULL,   -- IPv4 or IPv6
    app_version     VARCHAR(50)  DEFAULT NULL,   -- VITE_APP_VERSION

    -- Timing
    occurred_at     DATETIME     NOT NULL,       -- exact client-side timestamp
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_error_type  (error_type),
    INDEX idx_user_id     (user_id),
    INDEX idx_occurred_at (occurred_at)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: If error_logs already exists with the old minimal schema,
-- run these ALTER statements to add the new columns.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE error_logs
    ADD COLUMN IF NOT EXISTS username        VARCHAR(100)  DEFAULT NULL AFTER user_id,
    ADD COLUMN IF NOT EXISTS component_name  VARCHAR(255)  DEFAULT NULL AFTER error_stack,
    ADD COLUMN IF NOT EXISTS page_title      VARCHAR(500)  DEFAULT NULL AFTER page_url,
    ADD COLUMN IF NOT EXISTS referrer_url    VARCHAR(1000) DEFAULT NULL AFTER page_title,
    ADD COLUMN IF NOT EXISTS device_type     VARCHAR(50)   DEFAULT NULL AFTER referrer_url,
    ADD COLUMN IF NOT EXISTS device_model    VARCHAR(255)  DEFAULT NULL AFTER device_type,
    ADD COLUMN IF NOT EXISTS os_name         VARCHAR(100)  DEFAULT NULL AFTER device_model,
    ADD COLUMN IF NOT EXISTS os_version      VARCHAR(100)  DEFAULT NULL AFTER os_name,
    ADD COLUMN IF NOT EXISTS browser_name    VARCHAR(100)  DEFAULT NULL AFTER os_version,
    ADD COLUMN IF NOT EXISTS browser_version VARCHAR(100)  DEFAULT NULL AFTER browser_name,
    ADD COLUMN IF NOT EXISTS user_agent      TEXT          DEFAULT NULL AFTER browser_version,
    ADD COLUMN IF NOT EXISTS screen_width    SMALLINT      DEFAULT NULL AFTER user_agent,
    ADD COLUMN IF NOT EXISTS screen_height   SMALLINT      DEFAULT NULL AFTER screen_width,
    ADD COLUMN IF NOT EXISTS viewport_width  SMALLINT      DEFAULT NULL AFTER screen_height,
    ADD COLUMN IF NOT EXISTS viewport_height SMALLINT      DEFAULT NULL AFTER viewport_width,
    ADD COLUMN IF NOT EXISTS language        VARCHAR(20)   DEFAULT NULL AFTER viewport_height,
    ADD COLUMN IF NOT EXISTS timezone        VARCHAR(100)  DEFAULT NULL AFTER language,
    ADD COLUMN IF NOT EXISTS ip_address      VARCHAR(45)   DEFAULT NULL AFTER timezone,
    ADD COLUMN IF NOT EXISTS app_version     VARCHAR(50)   DEFAULT NULL AFTER ip_address,
    ADD COLUMN IF NOT EXISTS occurred_at     DATETIME      DEFAULT CURRENT_TIMESTAMP AFTER app_version,
    MODIFY COLUMN IF EXISTS page_url         VARCHAR(1000) DEFAULT NULL;

