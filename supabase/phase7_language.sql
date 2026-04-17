-- Phase 7: Multilingual support
-- Adds a per-user language preference. Defaults to English so existing rows keep their behaviour.
-- Supported values: 'en' (English), 'hi' (Hindi), 'mr' (Marathi).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

ALTER TABLE users
  ADD CONSTRAINT users_language_check
  CHECK (language IN ('en', 'hi', 'mr'));
