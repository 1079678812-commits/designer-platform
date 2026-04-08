-- 设计师接单平台 - 数据库建表 SQL
-- 请在 Supabase SQL Editor 中执行

-- Users
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'designer',
  phone TEXT,
  avatar TEXT,
  bio TEXT,
  title TEXT,
  slug TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service
CREATE TABLE IF NOT EXISTS "Service" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT '其他',
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  orderCount INTEGER NOT NULL DEFAULT 0,
  designerId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client
CREATE TABLE IF NOT EXISTS "Client" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  designerId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order
CREATE TABLE IF NOT EXISTS "Order" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  orderNo TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ,
  clientId TEXT REFERENCES "Client"(id) ON DELETE SET NULL,
  designerId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  serviceId TEXT REFERENCES "Service"(id) ON DELETE SET NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contract
CREATE TABLE IF NOT EXISTS "Contract" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  orderId TEXT REFERENCES "Order"(id) ON DELETE SET NULL,
  designerId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  signedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice
CREATE TABLE IF NOT EXISTS "Invoice" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoiceNo TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  orderId TEXT REFERENCES "Order"(id) ON DELETE SET NULL,
  designerId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  issuedAt TIMESTAMPTZ,
  paidAt TIMESTAMPTZ,
  dueDate TIMESTAMPTZ,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification
CREATE TABLE IF NOT EXISTS "Notification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT false,
  userId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio
CREATE TABLE IF NOT EXISTS "Portfolio" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  coverUrl TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  category TEXT,
  link TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  designerId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  userId TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resourceId TEXT,
  detail TEXT,
  ip TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PasswordReset
CREATE TABLE IF NOT EXISTS "PasswordReset" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  expiresAt TIMESTAMPTZ NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for tenant isolation
CREATE INDEX IF NOT EXISTS idx_service_designer ON "Service"(designerId);
CREATE INDEX IF NOT EXISTS idx_client_designer ON "Client"(designerId);
CREATE INDEX IF NOT EXISTS idx_order_designer ON "Order"(designerId);
CREATE INDEX IF NOT EXISTS idx_contract_designer ON "Contract"(designerId);
CREATE INDEX IF NOT EXISTS idx_invoice_designer ON "Invoice"(designerId);
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"(userId);
CREATE INDEX IF NOT EXISTS idx_portfolio_designer ON "Portfolio"(designerId);
CREATE INDEX IF NOT EXISTS idx_auditlog_created ON "AuditLog"(createdAt);

-- Enable RLS (Row Level Security) - Supabase best practice
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contract" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (our app uses JWT auth, not Supabase Auth)
CREATE POLICY "Service role full access" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON "Service" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON "Client" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON "Order" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON "Contract" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON "Invoice" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON "Notification" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON "Portfolio" FOR ALL USING (true) WITH CHECK (true);
