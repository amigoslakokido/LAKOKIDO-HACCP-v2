import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const HMS_AI_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hms-ai-analyzer`;

interface AIAnalysisRequest {
  section: string;
  action: 'analyze' | 'generate_report' | 'get_insights';
  data?: any;
}

interface AIConfig {
  id?: string;
  openai_api_key?: string;
  ai_model: string;
  analysis_frequency: string;
  enabled: boolean;
  auto_generate_reports: boolean;
  analysis_depth: string;
  language: string;
}

interface AIAnalysis {
  id: string;
  section_name: string;
  analysis_type: string;
  severity: string;
  title: string;
  description: string;
  detected_issues: string[];
  suggested_solutions: string[];
  risk_score: number;
  priority: string;
  status: string;
  analyzed_at: string;
  created_at: string;
}

interface AIReport {
  id: string;
  report_type: string;
  section_name: string;
  title: string;
  summary: string;
  content: any;
  statistics: any;
  recommendations: string[];
  critical_findings: number;
  warnings_count: number;
  compliance_score: number;
  generated_at: string;
  period_start: string;
  period_end: string;
}

interface AIInsight {
  id: string;
  insight_type: string;
  section_name: string | null;
  title: string;
  description: string;
  impact_level: string;
  actionable: boolean;
  action_items: string[];
  metrics: any;
  status: string;
  created_at: string;
  expires_at: string | null;
}

export const hmsAiApi = {
  async getConfig(): Promise<AIConfig | null> {
    try {
      const { data, error } = await supabase
        .from('hms_ai_config')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching AI config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching AI config:', error);
      return null;
    }
  },

  async updateConfig(config: Partial<AIConfig>): Promise<boolean> {
    try {
      const { data: existing } = await supabase
        .from('hms_ai_config')
        .select('id')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('hms_ai_config')
          .update({ ...config, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating AI config:', error);
          return false;
        }
      } else {
        const { error } = await supabase
          .from('hms_ai_config')
          .insert(config);

        if (error) {
          console.error('Error inserting AI config:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating AI config:', error);
      return false;
    }
  },

  async analyzeSection(section: string, data?: any): Promise<any> {
    try {
      const response = await fetch(HMS_AI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          section,
          action: 'analyze',
          data,
        } as AIAnalysisRequest),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error analyzing section:', error);
      return { success: false, error: error.message };
    }
  },

  async generateReport(section: string, data?: any): Promise<any> {
    try {
      const response = await fetch(HMS_AI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          section,
          action: 'generate_report',
          data,
        } as AIAnalysisRequest),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating report:', error);
      return { success: false, error: error.message };
    }
  },

  async getInsights(section?: string): Promise<AIInsight[]> {
    try {
      let query = supabase
        .from('hms_ai_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (section) {
        query = query.or(`section_name.eq.${section},section_name.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching insights:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
  },

  async getAnalyses(section?: string, limit: number = 10): Promise<AIAnalysis[]> {
    try {
      let query = supabase
        .from('hms_ai_analysis')
        .select('*')
        .order('analyzed_at', { ascending: false })
        .limit(limit);

      if (section) {
        query = query.eq('section_name', section);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching analyses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching analyses:', error);
      return [];
    }
  },

  async getReports(section?: string, limit: number = 10): Promise<AIReport[]> {
    try {
      let query = supabase
        .from('hms_ai_reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (section) {
        query = query.eq('section_name', section);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async deleteReport(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('hms_ai_reports')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting report:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  },

  async updateInsightStatus(id: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('hms_ai_insights')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating insight status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating insight status:', error);
      return false;
    }
  },

  async analyzeAllSections(): Promise<any> {
    const sections = ['risk-assessment', 'first-aid', 'fire-safety', 'work-environment'];
    const results = [];

    for (const section of sections) {
      const result = await this.analyzeSection(section);
      results.push(result);
    }

    return results;
  },

  async generateAllReports(): Promise<any> {
    const sections = ['risk-assessment', 'first-aid', 'fire-safety', 'work-environment'];
    const reports = [];

    for (const section of sections) {
      const report = await this.generateReport(section);
      if (report.success) {
        reports.push(report.report);
      }
    }

    return reports;
  },
};
