/*
  # Enable pg_cron Extension for Automated HACCP Reports

  1. Purpose
    - Enable the pg_cron extension for scheduling daily HACCP reports
    - Configure cron job to run daily at 11:00 AM UTC
    - Job calls the scheduled-daily-report Edge Function

  2. What This Does
    - Enables pg_cron extension (if not already enabled)
    - Sets up a daily cron job that triggers report generation
    - Uses Supabase's pg_net for HTTP calls to the Edge Function

  3. Cron Schedule
    - Runs daily at 11:00 AM UTC
    - Creates automatic HACCP daily reports with temperature, cleaning, hygiene, and cooling data
    - Generates mock data if no actual data exists for that day

  4. Important Notes
    - The Edge Function must be deployed and accessible
    - Config must have is_enabled = true in scheduled_reports_config table
    - One report maximum per day (won't create duplicate reports)
*/

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove old cron job if it exists
DO $$
BEGIN
  PERFORM cron.unschedule('daily-report-generation');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create new cron job to run daily at 11:00 AM UTC
SELECT cron.schedule(
  'daily-report-generation',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url := 'https://elytkfyxfjxscupnkmqp.supabase.co/functions/v1/scheduled-daily-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseXRrZnl4Zmp4c2N1cG5rbXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjAxNzgsImV4cCI6MjA3NzMzNjE3OH0.ZJjCpKLtZs3fuu6BLd7N3cfvCTjeblqkUQ9lWcEolDk'
    ),
    body := jsonb_build_object('triggered_at', now())
  ) as request_id;
  $$
);
