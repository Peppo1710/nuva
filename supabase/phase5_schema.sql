-- Phase 5: Reminders & Home Dashboard

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  medicine_name VARCHAR(200) NOT NULL,
  dose_amount DECIMAL(6,2) NOT NULL DEFAULT 1,
  dose_unit VARCHAR(20) NOT NULL DEFAULT 'tablet',
  reminder_time TIME NOT NULL,
  repeat_type VARCHAR(20) NOT NULL DEFAULT 'daily',
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  interval_hours INTEGER,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expo_notification_id VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_reminders" ON reminders FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(user_id, is_active);

-- Reminder logs for tracking taken/skipped/missed
CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_reminder_logs" ON reminder_logs FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_date ON reminder_logs(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder ON reminder_logs(reminder_id, scheduled_date);

-- Auto-update updated_at on reminders
CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_reminders_updated_at();
