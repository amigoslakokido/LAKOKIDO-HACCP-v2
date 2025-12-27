/*
  # Add Company ID to HMS Core Tables
  
  1. Changes
    - Add company_id to HMS core tables
    - Set default to Amigos La Kokido AS for existing data
    
  2. Tables Updated
    - hms_company_info
    - hms_company_settings
    - hms_employees
    - hms_departments
    - hms_personnel
    - hms_safety_representative
    - hms_categories
    - hms_documents
    - hms_attachments
*/

DO $$
DECLARE
  amigos_id uuid;
BEGIN
  SELECT id INTO amigos_id FROM companies WHERE name = 'Amigos La Kokido AS' LIMIT 1;
  
  -- hms_company_info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_company_info' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_company_info ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_company_info SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_company_info ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_company_info_company_id ON hms_company_info(company_id);
  END IF;

  -- hms_company_settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_company_settings' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_company_settings ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_company_settings SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_company_settings ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_company_settings_company_id ON hms_company_settings(company_id);
  END IF;

  -- hms_employees
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_employees' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_employees ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_employees SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_employees ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_employees_company_id ON hms_employees(company_id);
  END IF;

  -- hms_departments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_departments' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_departments ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_departments SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_departments ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_departments_company_id ON hms_departments(company_id);
  END IF;

  -- hms_personnel
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_personnel' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_personnel ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_personnel SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_personnel ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_personnel_company_id ON hms_personnel(company_id);
  END IF;

  -- hms_safety_representative
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_safety_representative' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_safety_representative ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_safety_representative SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_safety_representative ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_safety_representative_company_id ON hms_safety_representative(company_id);
  END IF;

  -- hms_categories
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_categories' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_categories ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_categories SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_categories ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_categories_company_id ON hms_categories(company_id);
  END IF;

  -- hms_documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_documents' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_documents ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_documents SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_documents ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_documents_company_id ON hms_documents(company_id);
  END IF;

  -- hms_attachments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_attachments' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_attachments ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_attachments SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_attachments ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_attachments_company_id ON hms_attachments(company_id);
  END IF;

END $$;