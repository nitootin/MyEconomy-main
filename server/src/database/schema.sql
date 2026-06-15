CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  birth_date VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  value NUMERIC(12, 2) NOT NULL CHECK (value > 0),
  month_ref CHAR(7) NOT NULL CHECK (month_ref ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expenses_user_month_idx
  ON expenses (user_id, month_ref);

CREATE TABLE IF NOT EXISTS monthly_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value NUMERIC(12, 2) NOT NULL CHECK (value > 0),
  month_ref CHAR(7) NOT NULL CHECK (month_ref ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, month_ref)
);

CREATE INDEX IF NOT EXISTS monthly_limits_user_month_idx
  ON monthly_limits (user_id, month_ref);
