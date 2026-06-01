-- ============================================================
-- BuildConnect Rwanda — Database Schema
-- Migration: 001_init
-- Run with: psql -U buildconnect_user -d buildconnect_dev -f 001_init.sql
-- ============================================================

-- Enable UUID generation (built into PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'CLIENT',
  'ENGINEER',
  'WORKER',
  'COMPANY',
  'SUPPLIER',
  'ADMIN'
);

CREATE TYPE job_status AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE application_status AS ENUM (
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN'
);

CREATE TYPE verification_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE message_status AS ENUM (
  'SENT',
  'DELIVERED',
  'READ'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  first_name     VARCHAR(100) NOT NULL,
  last_name      VARCHAR(100) NOT NULL,
  role           user_role NOT NULL,
  profile_photo  TEXT,
  bio            TEXT,
  phone          VARCHAR(20),
  district       VARCHAR(100),
  is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_district ON users(district);

-- ─────────────────────────────────────────────────────────────────────────────
-- REFRESH TOKENS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT NOT NULL UNIQUE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token   ON refresh_tokens(token);

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- One profile per user. Engineers/workers/companies share this table
-- but use different columns based on their role.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profession     VARCHAR(100),
  skills         TEXT[] NOT NULL DEFAULT '{}',
  experience     INT,                      -- years
  availability   BOOLEAN NOT NULL DEFAULT TRUE,
  portfolio_url  TEXT,
  linkedin_url   TEXT,
  rating         NUMERIC(3,2) DEFAULT 0,
  rating_count   INT NOT NULL DEFAULT 0,

  -- For licensed professionals (engineers, architects, etc.)
  license_number  VARCHAR(100),
  institution     VARCHAR(255),
  graduation_year INT,

  -- For companies and suppliers
  company_name    VARCHAR(255),
  registration_no VARCHAR(100),
  website         TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id     ON profiles(user_id);
CREATE INDEX idx_profiles_profession  ON profiles(profession);
CREATE INDEX idx_profiles_availability ON profiles(availability);

-- ─────────────────────────────────────────────────────────────────────────────
-- JOBS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  district        VARCHAR(100) NOT NULL,
  budget_min      NUMERIC(12,2),
  budget_max      NUMERIC(12,2),
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  profession      VARCHAR(100),
  status          job_status NOT NULL DEFAULT 'OPEN',
  posted_by_id    UUID NOT NULL REFERENCES users(id),
  start_date      DATE,
  deadline        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_status       ON jobs(status);
CREATE INDEX idx_jobs_district     ON jobs(district);
CREATE INDEX idx_jobs_profession   ON jobs(profession);
CREATE INDEX idx_jobs_posted_by_id ON jobs(posted_by_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- APPLICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES users(id),
  cover_letter  TEXT,
  proposed_rate NUMERIC(12,2),
  status        application_status NOT NULL DEFAULT 'PENDING',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One application per job per user
  CONSTRAINT uq_application UNIQUE (job_id, applicant_id)
);

CREATE INDEX idx_applications_job_id       ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status       ON applications(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- SAVED JOBS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE saved_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_saved_job UNIQUE (user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CONVERSATIONS & MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many: users <-> conversations
CREATE TABLE conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_members_user_id ON conversation_members(user_id);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  receiver_id     UUID NOT NULL REFERENCES users(id),
  content         TEXT NOT NULL,
  status          message_status NOT NULL DEFAULT 'SENT',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id       ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id     ON messages(receiver_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID NOT NULL REFERENCES users(id),
  target_id  UUID NOT NULL REFERENCES users(id),
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  job_id     UUID REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_target_id ON reviews(target_id);
CREATE INDEX idx_reviews_author_id ON reviews(author_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- PROJECTS (Portfolio showcase)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  images       TEXT[] NOT NULL DEFAULT '{}',
  completed_at DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_profile_id ON projects(profile_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION DOCUMENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE verification_docs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type    VARCHAR(50) NOT NULL, -- 'degree', 'certificate', 'license', 'national_id'
  file_url    TEXT NOT NULL,
  status      verification_status NOT NULL DEFAULT 'PENDING',
  admin_note  TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_docs_user_id ON verification_docs(user_id);
CREATE INDEX idx_verification_docs_status  ON verification_docs(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- Keeps updated_at accurate without touching it manually in every query.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_verification_docs_updated_at
  BEFORE UPDATE ON verification_docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();