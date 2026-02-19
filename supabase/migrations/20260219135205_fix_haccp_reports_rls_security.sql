/*
  # Fix HACCP Reports RLS Security - Implement Company-Based Access Control

  1. Security Issue
    - Current RLS policies use USING (true) and WITH CHECK (true) - COMPLETELY INSECURE
    - This allows ANY user to read, modify, and delete ANY report
    - Reports contain sensitive company data that must be protected

  2. Solution
    - Replace all policies with company-based access control
    - Only authenticated users can access their company's reports
    - Users from Company A cannot access Company B's data
    - Only authorized roles can modify reports (prevent unauthorized changes)
    - System (cron job) can insert reports via service role key

  3. New Security Rules
    - SELECT: Only users in the same company can view reports
    - INSERT: Only system/service role can insert (automated reports)
    - UPDATE: Only authorized roles in same company can update
    - DELETE: Only authorized roles in same company can delete
    - Config: Only service role can modify (automated job settings)

  4. Important Notes
    - Uses auth.uid() to identify current user
    - Checks company_id match in profiles table
    - Prevents cross-company data access
    - Maintains data integrity and confidentiality
*/

-- Drop all unsafe public policies from haccp_daily_reports
DROP POLICY IF EXISTS "Allow public delete from daily reports" ON haccp_daily_reports;
DROP POLICY IF EXISTS "Allow public insert to daily reports" ON haccp_daily_reports;
DROP POLICY IF EXISTS "Allow public read access to daily reports" ON haccp_daily_reports;
DROP POLICY IF EXISTS "Allow public update to daily reports" ON haccp_daily_reports;

-- Drop all unsafe public policies from scheduled_reports_config
DROP POLICY IF EXISTS "السماح للجميع بإدراج إعدادات الجد" ON scheduled_reports_config;
DROP POLICY IF EXISTS "السماح للجميع بتحديث إعدادات الجد" ON scheduled_reports_config;
DROP POLICY IF EXISTS "السماح للجميع بقراءة إعدادات الجد" ON scheduled_reports_config;

-- HACCP Daily Reports - Secure Policies

-- SELECT: Only authenticated users can view reports from their company
CREATE POLICY "Users can view their company reports"
  ON haccp_daily_reports
  FOR SELECT
  TO authenticated
  USING (
    company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- INSERT: Only service role can insert automated reports (via cron job)
CREATE POLICY "System can insert automated reports"
  ON haccp_daily_reports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: Only authorized users in same company can update reports
CREATE POLICY "Users can update their company reports"
  ON haccp_daily_reports
  FOR UPDATE
  TO authenticated
  USING (
    company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    AND
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('daglig_leder', 'kontrollor')
  )
  WITH CHECK (
    company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- DELETE: Only authorized users in same company can delete reports
CREATE POLICY "Users can delete their company reports"
  ON haccp_daily_reports
  FOR DELETE
  TO authenticated
  USING (
    company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    AND
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('daglig_leder', 'kontrollor')
  );

-- Scheduled Reports Config - Secure Policies (Service Role Only)

-- SELECT: Authenticated users can view config to know if reports are enabled
CREATE POLICY "Users can view report config"
  ON scheduled_reports_config
  FOR SELECT
  TO authenticated
  USING (
    company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

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
