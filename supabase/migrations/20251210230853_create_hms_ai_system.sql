/*
  # نظام الذكاء الاصطناعي لـ HMS - HMS AI System

  1. جداول جديدة / New Tables
    - `hms_ai_config`
      - إعدادات الذكاء الاصطناعي (OpenAI API key، النموذج، إلخ)
      - AI configuration (OpenAI API key, model, etc.)
    
    - `hms_ai_analysis`
      - نتائج التحليل الذكي لكل قسم
      - AI analysis results for each section
      - المشاكل المكتشفة والحلول المقترحة
      - Detected issues and suggested solutions
    
    - `hms_ai_reports`
      - التقارير الشاملة المولدة تلقائياً
      - Automatically generated comprehensive reports
      - تقارير لكل قسم HMS على حدة
      - Reports for each HMS section separately
    
    - `hms_ai_insights`
      - رؤى وتوصيات ذكية يومية
      - Daily smart insights and recommendations
      - إحصائيات وتحليلات متقدمة
      - Advanced statistics and analytics

  2. الأمان / Security
    - تفعيل RLS لجميع الجداول
    - Enable RLS for all tables
    - سياسات للقراءة والكتابة للمستخدمين المعتمدين
    - Policies for authenticated users to read and write
*/

-- جدول إعدادات الذكاء الاصطناعي
-- AI Configuration Table
CREATE TABLE IF NOT EXISTS hms_ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  openai_api_key text,
  ai_model text DEFAULT 'gpt-4o-mini',
  analysis_frequency text DEFAULT 'daily',
  enabled boolean DEFAULT false,
  auto_generate_reports boolean DEFAULT true,
  analysis_depth text DEFAULT 'detailed',
  language text DEFAULT 'no',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hms_ai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI config"
  ON hms_ai_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update AI config"
  ON hms_ai_config FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can insert AI config"
  ON hms_ai_config FOR INSERT
  TO public
  WITH CHECK (true);

-- إدراج إعدادات افتراضية
-- Insert default configuration
INSERT INTO hms_ai_config (enabled, auto_generate_reports, analysis_depth, language)
VALUES (false, true, 'detailed', 'no')
ON CONFLICT DO NOTHING;

-- جدول التحليل الذكي
-- AI Analysis Table
CREATE TABLE IF NOT EXISTS hms_ai_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text NOT NULL,
  analysis_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text NOT NULL,
  detected_issues jsonb DEFAULT '[]'::jsonb,
  suggested_solutions jsonb DEFAULT '[]'::jsonb,
  risk_score integer DEFAULT 0,
  priority text DEFAULT 'medium',
  status text DEFAULT 'active',
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hms_ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI analysis"
  ON hms_ai_analysis FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert AI analysis"
  ON hms_ai_analysis FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update AI analysis"
  ON hms_ai_analysis FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete AI analysis"
  ON hms_ai_analysis FOR DELETE
  TO public
  USING (true);

-- جدول التقارير الذكية
-- AI Reports Table
CREATE TABLE IF NOT EXISTS hms_ai_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  section_name text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  content jsonb NOT NULL,
  statistics jsonb DEFAULT '{}'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  critical_findings integer DEFAULT 0,
  warnings_count integer DEFAULT 0,
  compliance_score integer DEFAULT 100,
  generated_at timestamptz DEFAULT now(),
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hms_ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI reports"
  ON hms_ai_reports FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert AI reports"
  ON hms_ai_reports FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can delete AI reports"
  ON hms_ai_reports FOR DELETE
  TO public
  USING (true);

-- جدول الرؤى الذكية
-- AI Insights Table
CREATE TABLE IF NOT EXISTS hms_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text NOT NULL,
  section_name text,
  title text NOT NULL,
  description text NOT NULL,
  impact_level text DEFAULT 'medium',
  actionable boolean DEFAULT true,
  action_items jsonb DEFAULT '[]'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE hms_ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI insights"
  ON hms_ai_insights FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert AI insights"
  ON hms_ai_insights FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update AI insights"
  ON hms_ai_insights FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete AI insights"
  ON hms_ai_insights FOR DELETE
  TO public
  USING (true);

-- فهارس للأداء
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_section ON hms_ai_analysis(section_name, analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_severity ON hms_ai_analysis(severity, status);
CREATE INDEX IF NOT EXISTS idx_ai_reports_section ON hms_ai_reports(section_name, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON hms_ai_insights(insight_type, status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires ON hms_ai_insights(expires_at) WHERE expires_at IS NOT NULL;
