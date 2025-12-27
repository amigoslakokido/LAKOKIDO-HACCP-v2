/*
  # Add Company ID to Remaining HACCP Tables
  
  1. Changes
    - Add company_id to company info, documents, equipment, schedules
    - Set default to Amigos La Kokido AS for existing data
    
  2. Tables Updated
    - company_info
    - company_documents
    - equipment
    - employee_schedules
    - departments
    - haccp_report_settings
    - settings_password
*/

DO $$
DECLARE
  amigos_id uuid;
BEGIN
  SELECT id INTO amigos_id FROM companies WHERE name = 'Amigos La Kokido AS' LIMIT 1;
  
  -- company_info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_info' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE company_info ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE company_info SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE company_info ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_company_info_company_id ON company_info(company_id);
  END IF;

  -- company_documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_documents' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE company_documents ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE company_documents SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE company_documents ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_company_documents_company_id ON company_documents(company_id);
  END IF;

  -- equipment
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE equipment ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE equipment SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE equipment ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_equipment_company_id ON equipment(company_id);
  END IF;

  -- employee_schedules
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employee_schedules' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE employee_schedules ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE employee_schedules SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE employee_schedules ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_employee_schedules_company_id ON employee_schedules(company_id);
  END IF;

  -- departments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'departments' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE departments ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE departments SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE departments ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_departments_company_id ON departments(company_id);
  END IF;

  -- haccp_report_settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'haccp_report_settings' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE haccp_report_settings ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE haccp_report_settings SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE haccp_report_settings ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_haccp_report_settings_company_id ON haccp_report_settings(company_id);
  END IF;

  -- settings_password
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'settings_password' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE settings_password ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE settings_password SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE settings_password ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_settings_password_company_id ON settings_password(company_id);
  END IF;

END $$;