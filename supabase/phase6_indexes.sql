-- Phase 6: Performance indexes for all tables
-- Run in Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_active ON reminders(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_date ON reminder_logs(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder_date ON reminder_logs(reminder_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_medical_profiles_user_id ON medical_profiles(user_id);
