/*
  # Fix HACCP Reports - Allow Public Read Access

  Drop all existing policies and recreate with public read access
*/

DROP POLICY IF EXISTS "System can insert automated reports" ON haccp_daily_reports;
DROP POLICY IF EXISTS "Users can delete their company reports" ON haccp_daily_reports;
DROP POLICY IF EXISTS "Users can update their company reports" ON haccp_daily_reports;
DROP POLICY IF EXISTS "Users can view their company reports" ON haccp_daily_reports;
DROP POLICY IF EXISTS "System can create report config" ON scheduled_reports_config;
DROP POLICY IF EXISTS "System can delete report config" ON scheduled_reports_config;
DROP POLICY IF EXISTS "System can update report config" ON scheduled_reports_config;
DROP POLICY IF EXISTS "Users can view report config" ON scheduled_reports_config;

-- HACCP Daily Reports - Public Read with Secure Updates

-- SELECT: Public read access (no authentication required)
CREATE POLICY "Anyone can view reports"
  ON haccp_daily_reports
  FOR SELECT
  TO public
  USING (true);

-- INSERT: Only system can insert (via cron job)
CREATE POLICY "System can insert automated reports"
  ON haccp_daily_reports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: Only authenticated authorized users can update
CREATE POLICY "Authorized users can update reports"
  ON haccp_daily_reports
  FOR UPDATE
  TO authenticated
  USING (
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('daglig_leder', 'kontrollor')
  )
  WITH CHECK (
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('daglig_leder', 'kontrollor')
  );

-- DELETE: Only authenticated authorized users can delete
CREATE POLICY "Authorized users can delete reports"
  ON haccp_daily_reports
  FOR DELETE
  TO authenticated
  USING (
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('daglig_leder', 'kontrollor')
  );

-- Scheduled Reports Config

-- SELECT: Public read (so users know if auto-reports are enabled)
CREATE POLICY "Anyone can view report config"
  ON scheduled_reports_config
  FOR SELECT
  TO public
  USING (true);

-- INSERT: Only service role can create config
CREATE POLICY "System can create report config"
  ON scheduled_reports_config
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: Only service role can modify config
CREATE POLICY "System can update report config"
  ON scheduled_reports_config
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- DELETE: Only service role can delete config
CREATE POLICY "System can delete report config"
  ON scheduled_reports_config
  FOR DELETE
  TO service_role
  USING (true);
