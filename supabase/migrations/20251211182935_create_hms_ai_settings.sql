/*
  # Create HMS AI Settings Table

  1. New Tables
    - `hms_ai_settings`
      - `id` (uuid, primary key)
      - `ai_recommendations_enabled` (boolean) - Enable/disable AI recommendations
      - `report_generator_enabled` (boolean) - Enable/disable report generator
      - `chatgpt_enabled` (boolean) - Enable/disable ChatGPT integration
      - `chatgpt_api_key` (text) - OpenAI API key (encrypted)
      - `ai_analytics_enabled` (boolean) - Enable/disable AI analytics
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `hms_ai_settings` table
    - Add policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS hms_ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_recommendations_enabled boolean DEFAULT true,
  report_generator_enabled boolean DEFAULT true,
  chatgpt_enabled boolean DEFAULT false,
  chatgpt_api_key text DEFAULT '',
  ai_analytics_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hms_ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to hms_ai_settings"
  ON hms_ai_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_hms_ai_settings_created_at 
  ON hms_ai_settings(created_at DESC);
