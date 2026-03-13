-- Phase 3: Profile & Medical History Schema
-- Run this in Supabase SQL Editor

-- Add new columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
  ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5),
  ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- medical_profiles table: one per user
CREATE TABLE IF NOT EXISTS medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  past_surgeries JSONB[] DEFAULT '{}',
  doctor_name VARCHAR(100),
  doctor_specialty VARCHAR(100),
  doctor_phone VARCHAR(20),
  clinic_name VARCHAR(150),
  last_visit_date DATE,
  insurance_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  instructions TEXT,
  source VARCHAR(20) DEFAULT 'manual',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_medical_profiles" ON medical_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own_medications" ON medications
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_profiles_user_id ON medical_profiles(user_id);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medical_profiles_updated_at
  BEFORE UPDATE ON medical_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
