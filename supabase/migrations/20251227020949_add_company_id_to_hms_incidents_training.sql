/*
  # Add Company ID to HMS Incidents and Training Tables
  
  1. Tables Updated
    - hms_incidents
    - hms_incident_registry
    - hms_deviations
    - hms_followup
    - hms_training
    - hms_training_attendees
    - hms_training_history
    - training_log
    - training_fire_safety
    - training_first_aid
    - training_routine
    - training_routine_items
    - training_safety_equipment
    - training_new_employee_confirmation
    - hms_management_training_info
*/

DO $$
DECLARE
  amigos_id uuid;
BEGIN
  SELECT id INTO amigos_id FROM companies WHERE name = 'Amigos La Kokido AS' LIMIT 1;
  
  -- hms_incidents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_incidents' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_incidents ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_incidents SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_incidents ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_incidents_company_id ON hms_incidents(company_id);
  END IF;

  -- hms_incident_registry
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_incident_registry' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_incident_registry ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_incident_registry SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_incident_registry ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_incident_registry_company_id ON hms_incident_registry(company_id);
  END IF;

  -- hms_deviations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_deviations' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_deviations ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_deviations SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_deviations ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_deviations_company_id ON hms_deviations(company_id);
  END IF;

  -- hms_followup
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_followup' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_followup ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_followup SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_followup ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_followup_company_id ON hms_followup(company_id);
  END IF;

  -- hms_training
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_training' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_training ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_training SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_training ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_training_company_id ON hms_training(company_id);
  END IF;

  -- hms_training_attendees
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_training_attendees' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_training_attendees ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_training_attendees SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_training_attendees ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_training_attendees_company_id ON hms_training_attendees(company_id);
  END IF;

  -- hms_training_history
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_training_history' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_training_history ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_training_history SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_training_history ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_training_history_company_id ON hms_training_history(company_id);
  END IF;

  -- training_log
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'training_log' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE training_log ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE training_log SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE training_log ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_training_log_company_id ON training_log(company_id);
  END IF;

  -- training_fire_safety
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'training_fire_safety' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE training_fire_safety ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE training_fire_safety SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE training_fire_safety ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_training_fire_safety_company_id ON training_fire_safety(company_id);
  END IF;

  -- training_first_aid
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'training_first_aid' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE training_first_aid ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE training_first_aid SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE training_first_aid ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_training_first_aid_company_id ON training_first_aid(company_id);
  END IF;

  -- training_routine
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'training_routine' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE training_routine ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE training_routine SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE training_routine ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_training_routine_company_id ON training_routine(company_id);
  END IF;

  -- training_routine_items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'training_routine_items' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE training_routine_items ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE training_routine_items SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE training_routine_items ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_training_routine_items_company_id ON training_routine_items(company_id);
  END IF;

  -- training_safety_equipment
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'training_safety_equipment' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE training_safety_equipment ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE training_safety_equipment SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE training_safety_equipment ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_training_safety_equipment_company_id ON training_safety_equipment(company_id);
  END IF;

  -- training_new_employee_confirmation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'training_new_employee_confirmation' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE training_new_employee_confirmation ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE training_new_employee_confirmation SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE training_new_employee_confirmation ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_training_new_employee_confirmation_company_id ON training_new_employee_confirmation(company_id);
  END IF;

  -- hms_management_training_info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_management_training_info' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hms_management_training_info ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hms_management_training_info SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hms_management_training_info ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hms_management_training_info_company_id ON hms_management_training_info(company_id);
  END IF;

END $$;