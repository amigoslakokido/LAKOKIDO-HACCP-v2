/*
  # Remove Reports System

  1. Changes
    - Drop daily_reports table
    - Drop scheduled_reports table
    - Drop all report-related functions
    - Remove cron jobs for reports
  
  2. Reason
    - System has too many errors
    - Complete removal requested by user
*/

-- Drop cron jobs
DROP EXTENSION IF EXISTS pg_cron CASCADE;

-- Drop scheduled reports table
DROP TABLE IF EXISTS scheduled_reports CASCADE;

-- Drop daily reports table
DROP TABLE IF EXISTS daily_reports CASCADE;

-- Drop any report-related functions
DROP FUNCTION IF EXISTS generate_daily_report CASCADE;
DROP FUNCTION IF EXISTS schedule_daily_report CASCADE;
