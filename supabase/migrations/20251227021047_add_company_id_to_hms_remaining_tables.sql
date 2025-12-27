/*
  # Add Company ID to HMS Remaining Tables
  
  1. Tables Updated
    - hms_environment_waste
    - hms_environment_cleaning_products
    - hms_environment_frying_oil
    - hms_environment_grease_trap
    - hms_environment_green_transport
    - hms_environment_goals
    - hms_environmental_partners
    - hms_work_environment_assessments
    - hms_work_environment_deviations
    - hms_work_environment_items
    - hms_maintenance
    - hms_locations
    - hms_settings
    - hms_reports
    - hms_report_templates
    - hms_ai_config
    - hms_ai_settings
    - hms_ai_analysis
    - hms_ai_insights
    - hms_ai_reports
    - hms_ai_knowledge_base
*/

DO $$
DECLARE
  amigos_id uuid;
BEGIN
  SELECT id INTO amigos_id FROM companies WHERE name = 'Amigos La Kokido AS' LIMIT 1;
  
  -- hms_environment_waste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_environment_waste' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_environment_waste ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_environment_waste SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_environment_waste ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_environment_waste_company_id ON hms_environment_waste(company_id);
  END IF;

  -- hms_environment_cleaning_products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_environment_cleaning_products' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_environment_cleaning_products ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_environment_cleaning_products SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_environment_cleaning_products ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_environment_cleaning_products_company_id ON hms_environment_cleaning_products(company_id);
  END IF;

  -- hms_environment_frying_oil
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_environment_frying_oil' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_environment_frying_oil ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_environment_frying_oil SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_environment_frying_oil ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_environment_frying_oil_company_id ON hms_environment_frying_oil(company_id);
  END IF;

  -- hms_environment_grease_trap
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_environment_grease_trap' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_environment_grease_trap ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_environment_grease_trap SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_environment_grease_trap ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_environment_grease_trap_company_id ON hms_environment_grease_trap(company_id);
  END IF;

  -- hms_environment_green_transport
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_environment_green_transport' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_environment_green_transport ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_environment_green_transport SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_environment_green_transport ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_environment_green_transport_company_id ON hms_environment_green_transport(company_id);
  END IF;

  -- hms_environment_goals
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_environment_goals' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_environment_goals ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_environment_goals SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_environment_goals ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_environment_goals_company_id ON hms_environment_goals(company_id);
  END IF;

  -- hms_environmental_partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_environmental_partners' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_environmental_partners ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_environmental_partners SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_environmental_partners ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_environmental_partners_company_id ON hms_environmental_partners(company_id);
  END IF;

  -- hms_work_environment_assessments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_work_environment_assessments' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_work_environment_assessments ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_work_environment_assessments SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_work_environment_assessments ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_work_environment_assessments_company_id ON hms_work_environment_assessments(company_id);
  END IF;

  -- hms_work_environment_deviations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_work_environment_deviations' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_work_environment_deviations ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_work_environment_deviations SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_work_environment_deviations ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_work_environment_deviations_company_id ON hms_work_environment_deviations(company_id);
  END IF;

  -- hms_work_environment_items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_work_environment_items' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_work_environment_items ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_work_environment_items SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_work_environment_items ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_work_environment_items_company_id ON hms_work_environment_items(company_id);
  END IF;

  -- hms_maintenance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_maintenance' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_maintenance ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_maintenance SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_maintenance ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_maintenance_company_id ON hms_maintenance(company_id);
  END IF;

  -- hms_locations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_locations' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_locations ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_locations SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_locations ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_locations_company_id ON hms_locations(company_id);
  END IF;

  -- hms_settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_settings' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_settings ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_settings SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_settings ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_settings_company_id ON hms_settings(company_id);
  END IF;

  -- hms_reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_reports' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_reports ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_reports SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_reports ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_reports_company_id ON hms_reports(company_id);
  END IF;

  -- hms_report_templates
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_report_templates' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_report_templates ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_report_templates SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_report_templates ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_report_templates_company_id ON hms_report_templates(company_id);
  END IF;

  -- hms_ai_config
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_ai_config' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_ai_config ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_ai_config SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_ai_config ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_ai_config_company_id ON hms_ai_config(company_id);
  END IF;

  -- hms_ai_settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_ai_settings' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_ai_settings ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_ai_settings SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_ai_settings ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_ai_settings_company_id ON hms_ai_settings(company_id);
  END IF;

  -- hms_ai_analysis
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_ai_analysis' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_ai_analysis ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_ai_analysis SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_ai_analysis ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_ai_analysis_company_id ON hms_ai_analysis(company_id);
  END IF;

  -- hms_ai_insights
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_ai_insights' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_ai_insights ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_ai_insights SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_ai_insights ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_ai_insights_company_id ON hms_ai_insights(company_id);
  END IF;

  -- hms_ai_reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_ai_reports' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_ai_reports ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_ai_reports SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_ai_reports ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_ai_reports_company_id ON hms_ai_reports(company_id);
  END IF;

  -- hms_ai_knowledge_base
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_ai_knowledge_base' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_ai_knowledge_base ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_ai_knowledge_base SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_ai_knowledge_base ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_ai_knowledge_base_company_id ON hms_ai_knowledge_base(company_id);
  END IF;

END $$;