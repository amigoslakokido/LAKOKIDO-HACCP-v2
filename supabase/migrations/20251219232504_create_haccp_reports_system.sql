/*
  # Create HACCP Reports System

  1. New Tables
    - haccp_daily_reports: Store daily HACCP reports
    - haccp_report_settings: Settings for automatic report generation

  2. Security
    - Enable RLS on all tables
    - Add policies for public access
*/

-- Create haccp_daily_reports table
CREATE TABLE IF NOT EXISTS haccp_daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL,
  generated_at timestamptz DEFAULT now(),
  generated_by text,
  report_type text CHECK (report_type IN ('manual', 'automatic')) DEFAULT 'manual',
  overall_status text CHECK (overall_status IN ('pass', 'warning', 'fail')) DEFAULT 'pass',
  temperature_data jsonb DEFAULT '[]'::jsonb,
  cleaning_data jsonb DEFAULT '[]'::jsonb,
  hygiene_data jsonb DEFAULT '[]'::jsonb,
  cooling_data jsonb DEFAULT '[]'::jsonb,
  notes text,
  signed_by text,
  signed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(report_date)
);

-- Create haccp_report_settings table
CREATE TABLE IF NOT EXISTS haccp_report_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_generation_enabled boolean DEFAULT false,
  generation_time time DEFAULT '23:00:00',
  weekend_employees_count integer DEFAULT 4 CHECK (weekend_employees_count BETWEEN 4 AND 5),
  weekday_employees_count integer DEFAULT 2,
  require_signature boolean DEFAULT true,
  include_logo boolean DEFAULT true,
  settings_password text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO haccp_report_settings (auto_generation_enabled, settings_password)
VALUES (false, '1234')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE haccp_daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE haccp_report_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to daily reports"
  ON haccp_daily_reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to daily reports"
  ON haccp_daily_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to daily reports"
  ON haccp_daily_reports FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from daily reports"
  ON haccp_daily_reports FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to report settings"
  ON haccp_report_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public update to report settings"
  ON haccp_report_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_haccp_daily_reports_date ON haccp_daily_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_haccp_daily_reports_created ON haccp_daily_reports(created_at DESC);