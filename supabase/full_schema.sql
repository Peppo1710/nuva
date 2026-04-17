-- ============================================================
--  NUVA – Full Database Schema
--  Paste this entire file into Supabase SQL Editor and Run.
--  Creates all tables, RLS policies, indexes, and triggers.
-- ============================================================

-- ── 1. USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                   VARCHAR(20) UNIQUE NOT NULL,
  username                VARCHAR(100),
  age                     INTEGER,
  primary_goal            VARCHAR(50),
  theme_preference        VARCHAR(10) DEFAULT 'dark',
  gender                  VARCHAR(20),
  blood_group             VARCHAR(5),
  weight_kg               DECIMAL(5,2),
  height_cm               DECIMAL(5,2),
  city                    VARCHAR(100),
  emergency_contact_name  VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  avatar_url              TEXT,
  language                TEXT NOT NULL DEFAULT 'en',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_language_check CHECK (language IN ('en', 'hi', 'mr'))
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_users" ON users FOR ALL USING (auth.uid() = id);

-- ── 2. MEDICAL PROFILES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conditions       TEXT[]   DEFAULT '{}',
  allergies        TEXT[]   DEFAULT '{}',
  past_surgeries   JSONB[]  DEFAULT '{}',
  doctor_name      VARCHAR(100),
  doctor_specialty VARCHAR(100),
  doctor_phone     VARCHAR(20),
  clinic_name      VARCHAR(150),
  last_visit_date  DATE,
  insurance_number VARCHAR(100),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_medical_profiles" ON medical_profiles FOR ALL USING (auth.uid() = user_id);

-- ── 3. MEDICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(200) NOT NULL,
  dosage       VARCHAR(100),
  frequency    VARCHAR(100),
  instructions TEXT,
  source       VARCHAR(20) DEFAULT 'manual',
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_medications" ON medications FOR ALL USING (auth.uid() = user_id);

-- ── 4. CHAT MESSAGES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_chat_messages" ON chat_messages FOR ALL USING (auth.uid() = user_id);

-- ── 5. REMINDERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminders (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_id          UUID REFERENCES medications(id) ON DELETE SET NULL,
  medicine_name          VARCHAR(200) NOT NULL,
  dose_amount            DECIMAL(6,2) NOT NULL DEFAULT 1,
  dose_unit              VARCHAR(20)  NOT NULL DEFAULT 'tablet',
  reminder_time          TIME NOT NULL,
  repeat_type            VARCHAR(20)  NOT NULL DEFAULT 'daily',
  days_of_week           INTEGER[]    DEFAULT '{0,1,2,3,4,5,6}',
  interval_hours         INTEGER,
  start_date             DATE,
  end_date               DATE,
  notes                  TEXT,
  is_active              BOOLEAN NOT NULL DEFAULT true,
  expo_notification_id   VARCHAR(200),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_reminders" ON reminders FOR ALL USING (auth.uid() = user_id);

-- ── 6. REMINDER LOGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminder_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id    UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending',
  taken_at       TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_reminder_logs" ON reminder_logs FOR ALL USING (auth.uid() = user_id);

-- ── 7. INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_medications_user_id          ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_profiles_user_id     ON medical_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id            ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_active        ON reminders(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created   ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_date      ON reminder_logs(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder_date  ON reminder_logs(reminder_id, scheduled_date);

-- ── 8. AUTO updated_at TRIGGERS ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER medical_profiles_updated_at
  BEFORE UPDATE ON medical_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
