-- GST Billing System - PostgreSQL Schema

CREATE TABLE IF NOT EXISTS shop_settings (
    id SERIAL PRIMARY KEY,
    shop_name VARCHAR(200) NOT NULL,
    address TEXT,
    state VARCHAR(100) NOT NULL,
    gstin VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(150),
    invoice_prefix VARCHAR(10) DEFAULT 'INV-',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    profile_picture TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'Owner',
    permissions JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gst_rates (
    id SERIAL PRIMARY KEY,
    rate NUMERIC(5,2) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    address TEXT,
    state VARCHAR(100) NOT NULL,
    gstin VARCHAR(20),
    email VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    hsn_code VARCHAR(20),
    price NUMERIC(12,2) NOT NULL,
    gst_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    invoice_no VARCHAR(30) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    party_id INTEGER REFERENCES parties(id) ON DELETE SET NULL,
    party_name VARCHAR(150) NOT NULL,
    party_mobile VARCHAR(15),
    party_address TEXT,
    party_state VARCHAR(100) NOT NULL,
    party_gstin VARCHAR(20),
    shop_state VARCHAR(100) NOT NULL,
    tax_type VARCHAR(20) NOT NULL, -- 'CGST_SGST' or 'IGST'
    subtotal NUMERIC(12,2) NOT NULL,
    total_tax NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Unpaid',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    hsn_code VARCHAR(20),
    qty NUMERIC(10,2) NOT NULL,
    rate NUMERIC(12,2) NOT NULL,
    gst_percent NUMERIC(5,2) NOT NULL,
    taxable_amt NUMERIC(12,2) NOT NULL,
    cgst NUMERIC(12,2) NOT NULL DEFAULT 0,
    sgst NUMERIC(12,2) NOT NULL DEFAULT 0,
    igst NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bills_party ON bills(party_id);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(invoice_date);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1001;

INSERT INTO shop_settings (id, shop_name, address, state, gstin, phone, email, invoice_prefix)
VALUES (1, 'Darshan Electronics & Retail', '101 University Road, Near Rajkot Highway, Rajkot, Gujarat - 360005', 'Gujarat', '24AAACD1234E1Z5', '+91 98765 43210', 'contact@darshanelectronics.com', 'INV-')
ON CONFLICT (id) DO NOTHING;
