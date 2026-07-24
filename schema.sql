CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name VARCHAR(100) NOT NULL,
 email VARCHAR(255) UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 role VARCHAR(20) DEFAULT 'admin',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name VARCHAR(100) UNIQUE NOT NULL,
 description TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 category_id UUID NOT NULL REFERENCES categories(id),
 name VARCHAR(200) NOT NULL,
 sku VARCHAR(100) UNIQUE NOT NULL,
 price NUMERIC(10,2) NOT NULL CHECK(price>=0),
 quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity>=0),
 low_stock_threshold INTEGER NOT NULL DEFAULT 10,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_movements (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 movement_type VARCHAR(20) CHECK(movement_type IN ('IN','OUT')),
 quantity INTEGER NOT NULL CHECK(quantity>0),
 reason TEXT,
 created_by UUID REFERENCES users(id),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_product_sku ON products(sku);
CREATE INDEX idx_category_name ON categories(name);
CREATE INDEX idx_stock_product ON stock_movements(product_id);

INSERT INTO categories(name,description) VALUES
('Electronics','Electronic Items'),
('Stationery','Office Supplies'),
('Furniture','Furniture Products');
