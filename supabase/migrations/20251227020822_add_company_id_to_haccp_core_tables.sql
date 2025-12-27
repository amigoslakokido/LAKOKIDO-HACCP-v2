/*
  # Add Company ID to HACCP Core Tables
  
  1. Changes
    - Add company_id column to core HACCP tables
    - Set default to Amigos La Kokido AS for existing data
    - Add foreign key constraints and indexes
    
  2. Tables Updated
    - zones
    - cleaning_tasks
    - employees
    - profiles
    - temperature_logs
    - cleaning_logs
    - cooling_logs
    - hygiene_checks
    - dishwasher_logs
*/

-- Get the Amigos company ID
DO $$
DECLARE
  amigos_id uuid;
BEGIN
  SELECT id INTO amigos_id FROM companies WHERE name = 'Amigos La Kokido AS' LIMIT 1;
  
  -- zones
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'zones' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE zones ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE zones SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE zones ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_zones_company_id ON zones(company_id);
  END IF;

  -- cleaning_tasks
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cleaning_tasks' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE cleaning_tasks ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE cleaning_tasks SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE cleaning_tasks ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_cleaning_tasks_company_id ON cleaning_tasks(company_id);
  END IF;

  -- employees
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE employees SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE employees ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_employees_company_id ON employees(company_id);
  END IF;

  -- profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE profiles SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE profiles ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_profiles_company_id ON profiles(company_id);
  END IF;

  -- temperature_logs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'temperature_logs' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE temperature_logs ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE temperature_logs SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE temperature_logs ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_temperature_logs_company_id ON temperature_logs(company_id);
  END IF;

  -- cleaning_logs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cleaning_logs' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE cleaning_logs ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE cleaning_logs SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE cleaning_logs ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_cleaning_logs_company_id ON cleaning_logs(company_id);
  END IF;

  -- cooling_logs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cooling_logs' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE cooling_logs ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE cooling_logs SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE cooling_logs ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_cooling_logs_company_id ON cooling_logs(company_id);
  END IF;

  -- hygiene_checks
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hygiene_checks' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE hygiene_checks ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE hygiene_checks SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE hygiene_checks ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_hygiene_checks_company_id ON hygiene_checks(company_id);
  END IF;

  -- dishwasher_logs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dishwasher_logs' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE dishwasher_logs ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE dishwasher_logs SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE dishwasher_logs ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_dishwasher_logs_company_id ON dishwasher_logs(company_id);
  END IF;

END $$;