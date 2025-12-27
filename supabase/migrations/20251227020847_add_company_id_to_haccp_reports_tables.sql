/*
  # Add Company ID to HACCP Reports and Additional Tables
  
  1. Changes
    - Add company_id to reports, incidents, routine tasks, notifications
    - Set default to Amigos La Kokido AS for existing data
    
  2. Tables Updated
    - critical_incidents
    - incident_attachments
    - haccp_daily_reports
    - scheduled_reports_config
    - routine_tasks
    - routine_task_logs
    - routine_report_task_details
    - daily_routine_reports
    - daily_routine_logs
    - notification_settings
*/

DO $$
DECLARE
  amigos_id uuid;
BEGIN
  SELECT id INTO amigos_id FROM companies WHERE name = 'Amigos La Kokido AS' LIMIT 1;
  
  -- critical_incidents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'critical_incidents' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE critical_incidents ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE critical_incidents SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE critical_incidents ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_critical_incidents_company_id ON critical_incidents(company_id);
  END IF;

  -- incident_attachments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incident_attachments' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE incident_attachments ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE incident_attachments SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE incident_attachments ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_incident_attachments_company_id ON incident_attachments(company_id);
  END IF;

  -- haccp_daily_reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'haccp_daily_reports' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE haccp_daily_reports ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE haccp_daily_reports SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE haccp_daily_reports ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_haccp_daily_reports_company_id ON haccp_daily_reports(company_id);
  END IF;

  -- scheduled_reports_config
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scheduled_reports_config' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE scheduled_reports_config ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE scheduled_reports_config SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE scheduled_reports_config ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_scheduled_reports_config_company_id ON scheduled_reports_config(company_id);
  END IF;

  -- routine_tasks
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'routine_tasks' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE routine_tasks ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE routine_tasks SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE routine_tasks ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_routine_tasks_company_id ON routine_tasks(company_id);
  END IF;

  -- routine_task_logs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'routine_task_logs' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE routine_task_logs ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE routine_task_logs SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE routine_task_logs ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_routine_task_logs_company_id ON routine_task_logs(company_id);
  END IF;

  -- routine_report_task_details
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'routine_report_task_details' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE routine_report_task_details ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE routine_report_task_details SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE routine_report_task_details ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_routine_report_task_details_company_id ON routine_report_task_details(company_id);
  END IF;

  -- daily_routine_reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_routine_reports' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE daily_routine_reports ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE daily_routine_reports SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE daily_routine_reports ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_daily_routine_reports_company_id ON daily_routine_reports(company_id);
  END IF;

  -- daily_routine_logs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_routine_logs' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE daily_routine_logs ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE daily_routine_logs SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE daily_routine_logs ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_daily_routine_logs_company_id ON daily_routine_logs(company_id);
  END IF;

  -- notification_settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_settings' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE notification_settings ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
    UPDATE notification_settings SET company_id = amigos_id WHERE company_id IS NULL;
    ALTER TABLE notification_settings ALTER COLUMN company_id SET NOT NULL;
    CREATE INDEX idx_notification_settings_company_id ON notification_settings(company_id);
  END IF;

END $$;