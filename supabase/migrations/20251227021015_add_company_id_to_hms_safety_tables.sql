/*
  # Add Company ID to HMS Safety Tables
  
  1. Tables Updated
    - hms_fire_equipment
    - hms_fire_inspections
    - hms_fire_responsible
    - hms_fire_deviations
    - hms_fire_documents
    - hms_fire_instructions
    - hms_first_aid_equipment
    - hms_first_aid_inspections
    - hms_first_aid_responsible
    - hms_evacuation_plan
    - hms_evacuation_roles
    - hms_evacuation_drills
    - hms_evacuation_documents
    - hms_escape_routes
    - hms_risk_assessments
    - hms_insurance_companies
*/

DO $$
DECLARE
  amigos_id uuid;
BEGIN
  SELECT id INTO amigos_id FROM companies WHERE name = 'Amigos La Kokido AS' LIMIT 1;
  
  -- hms_fire_equipment
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_fire_equipment' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_fire_equipment ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_fire_equipment SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_fire_equipment ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_fire_equipment_company_id ON hms_fire_equipment(company_id);
  END IF;

  -- hms_fire_inspections
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_fire_inspections' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_fire_inspections ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_fire_inspections SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_fire_inspections ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_fire_inspections_company_id ON hms_fire_inspections(company_id);
  END IF;

  -- hms_fire_responsible
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_fire_responsible' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_fire_responsible ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_fire_responsible SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_fire_responsible ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_fire_responsible_company_id ON hms_fire_responsible(company_id);
  END IF;

  -- hms_fire_deviations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_fire_deviations' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_fire_deviations ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_fire_deviations SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_fire_deviations ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_fire_deviations_company_id ON hms_fire_deviations(company_id);
  END IF;

  -- hms_fire_documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_fire_documents' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_fire_documents ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_fire_documents SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_fire_documents ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_fire_documents_company_id ON hms_fire_documents(company_id);
  END IF;

  -- hms_fire_instructions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_fire_instructions' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_fire_instructions ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_fire_instructions SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_fire_instructions ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_fire_instructions_company_id ON hms_fire_instructions(company_id);
  END IF;

  -- hms_first_aid_equipment
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_first_aid_equipment' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_first_aid_equipment ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_first_aid_equipment SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_first_aid_equipment ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_first_aid_equipment_company_id ON hms_first_aid_equipment(company_id);
  END IF;

  -- hms_first_aid_inspections
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_first_aid_inspections' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_first_aid_inspections ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_first_aid_inspections SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_first_aid_inspections ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_first_aid_inspections_company_id ON hms_first_aid_inspections(company_id);
  END IF;

  -- hms_first_aid_responsible
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_first_aid_responsible' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_first_aid_responsible ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_first_aid_responsible SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_first_aid_responsible ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_first_aid_responsible_company_id ON hms_first_aid_responsible(company_id);
  END IF;

  -- hms_evacuation_plan
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_evacuation_plan' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_evacuation_plan ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_evacuation_plan SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_evacuation_plan ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_evacuation_plan_company_id ON hms_evacuation_plan(company_id);
  END IF;

  -- hms_evacuation_roles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_evacuation_roles' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_evacuation_roles ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_evacuation_roles SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_evacuation_roles ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_evacuation_roles_company_id ON hms_evacuation_roles(company_id);
  END IF;

  -- hms_evacuation_drills
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_evacuation_drills' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_evacuation_drills ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_evacuation_drills SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_evacuation_drills ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_evacuation_drills_company_id ON hms_evacuation_drills(company_id);
  END IF;

  -- hms_evacuation_documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_evacuation_documents' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_evacuation_documents ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_evacuation_documents SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_evacuation_documents ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_evacuation_documents_company_id ON hms_evacuation_documents(company_id);
  END IF;

  -- hms_escape_routes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_escape_routes' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_escape_routes ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_escape_routes SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_escape_routes ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_escape_routes_company_id ON hms_escape_routes(company_id);
  END IF;

  -- hms_risk_assessments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_risk_assessments' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_risk_assessments ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_risk_assessments SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_risk_assessments ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_risk_assessments_company_id ON hms_risk_assessments(company_id);
  END IF;

  -- hms_insurance_companies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_insurance_companies' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_insurance_companies ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_insurance_companies SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_insurance_companies ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_insurance_companies_company_id ON hms_insurance_companies(company_id);
  END IF;

END $$;