/*
  # Add Performance Indexes for HACCP Reports Security

  1. Purpose
    - Optimize RLS policy queries that filter by company_id
    - Speed up common access patterns
    - Reduce database load from repeated policy checks

  2. Indexes Added
    - profiles(company_id): For quick company membership lookup in RLS policies
    - haccp_daily_reports(company_id): For filtering reports by company
    - haccp_daily_reports(report_date): For finding reports by date
    - scheduled_reports_config(company_id): For config lookup

  3. Performance Impact
    - Policy checks will execute in O(log n) instead of O(n)
    - Queries filtering by company will be significantly faster
*/

-- Index for profiles company lookup (used in RLS policies)
CREATE INDEX IF NOT EXISTS idx_profiles_company_id 
  ON profiles(company_id);

-- Index for haccp_daily_reports company filtering
CREATE INDEX IF NOT EXISTS idx_haccp_daily_reports_company_id 
  ON haccp_daily_reports(company_id);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_haccp_daily_reports_date 
  ON haccp_daily_reports(report_date DESC);

-- Index for company + date queries
CREATE INDEX IF NOT EXISTS idx_haccp_daily_reports_company_date 
  ON haccp_daily_reports(company_id, report_date DESC);

-- Index for scheduled config company lookup
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_config_company_id 
  ON scheduled_reports_config(company_id);
