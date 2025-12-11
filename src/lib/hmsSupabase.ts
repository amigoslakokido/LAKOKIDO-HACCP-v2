import { supabase } from './supabase';

export { supabase };

export interface HMSIncident {
  id: string;
  incident_number: string;
  category_id: string;
  location_id: string;
  employee_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_date: string;
  incident_time: string;
  immediate_action?: string;
  preventive_action?: string;
  root_cause?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reported_by: string;
  supervisor_id?: string;
  requires_approval: boolean;
  approved_at?: string;
  approved_by?: string;
  ai_generated: boolean;
  ai_analysis?: string;
  ai_recommendations?: string;
  compliance_score?: number;
  created_at: string;
  updated_at: string;
}

export interface HMSReport {
  id: string;
  report_number: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'incident' | 'custom';
  title: string;
  summary: string;
  start_date: string;
  end_date: string;
  total_incidents: number;
  safety_incidents: number;
  environment_incidents: number;
  health_incidents: number;
  deviations: number;
  compliance_score: number;
  ai_insights?: string;
  recommendations?: string;
  generated_by: string;
  created_by: string;
  pdf_path?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface HMSCategory {
  id: string;
  name: string;
  name_no: string;
  name_ar: string;
  type: 'safety' | 'environment' | 'health' | 'deviation';
  color: string;
  icon: string;
}

export interface HMSEmployee {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'supervisor' | 'employee';
  department?: string;
  active: boolean;
}

export interface HMSLocation {
  id: string;
  name: string;
  name_no: string;
  name_ar: string;
  type: string;
}

export interface HMSAttachment {
  id: string;
  incident_id?: string;
  report_id?: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface HMSTrainingSession {
  id: string;
  topic: string;
  description: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  trainer: string;
  location: string;
  attendees: string[];
  attendance_count: number;
  materials_url?: string;
  certificate_issued: boolean;
  created_at: string;
}

export interface HMSMaintenance {
  id: string;
  equipment_name: string;
  equipment_location: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection' | 'emergency';
  scheduled_date: string;
  completed_date?: string;
  description: string;
  performed_by?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cost?: number;
  notes?: string;
  created_at: string;
}

export const hmsApi = {
  // Incidents
  async getIncidents() {
    const { data, error } = await supabase
      .from('hms_incidents')
      .select('*')
      .order('incident_date', { ascending: false });
    return { data, error };
  },

  async getIncidentById(id: string) {
    const { data, error } = await supabase
      .from('hms_incidents')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return { data, error };
  },

  async createIncident(incident: Partial<HMSIncident>) {
    const { data, error } = await supabase
      .from('hms_incidents')
      .insert(incident)
      .select()
      .single();
    return { data, error };
  },

  async updateIncident(id: string, updates: Partial<HMSIncident>) {
    const { data, error } = await supabase
      .from('hms_incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Reports
  async getReports() {
    const { data, error } = await supabase
      .from('hms_reports')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createReport(report: Partial<HMSReport>) {
    const { data, error } = await supabase
      .from('hms_reports')
      .insert(report)
      .select()
      .single();
    return { data, error };
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('hms_categories')
      .select('*')
      .order('name');
    return { data, error };
  },

  // Employees
  async getEmployees() {
    const { data, error } = await supabase
      .from('hms_employees')
      .select('*')
      .eq('active', true)
      .order('name');
    return { data, error };
  },

  // Locations
  async getLocations() {
    const { data, error } = await supabase
      .from('hms_locations')
      .select('*')
      .order('name');
    return { data, error };
  },

  // Training
  async getTrainingSessions() {
    const { data, error } = await supabase
      .from('hms_training')
      .select('*')
      .order('session_date', { ascending: false });
    return { data, error };
  },

  // Maintenance
  async getMaintenance() {
    const { data, error } = await supabase
      .from('hms_maintenance')
      .select('*')
      .order('scheduled_date', { ascending: false });
    return { data, error };
  },

  // Training
  async createTrainingSession(session: Partial<HMSTrainingSession>) {
    const { data, error } = await supabase
      .from('hms_training')
      .insert(session)
      .select()
      .single();
    return { data, error };
  },

  // Maintenance
  async createMaintenance(maintenance: Partial<HMSMaintenance>) {
    const { data, error } = await supabase
      .from('hms_maintenance')
      .insert(maintenance)
      .select()
      .single();
    return { data, error };
  },

  // Statistics
  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: incidents } = await supabase
      .from('hms_incidents')
      .select('*')
      .gte('incident_date', lastWeek);

    const { data: reports } = await supabase
      .from('hms_reports')
      .select('*')
      .gte('start_date', lastWeek);

    return {
      totalIncidents: incidents?.length || 0,
      openIncidents: incidents?.filter(i => i.status === 'open').length || 0,
      criticalIncidents: incidents?.filter(i => i.severity === 'critical').length || 0,
      reportsGenerated: reports?.length || 0,
      avgComplianceScore: reports?.reduce((sum, r) => sum + r.compliance_score, 0) / (reports?.length || 1) || 100,
    };
  },

  // Personnel Management
  async getPersonnel() {
    const { data, error } = await supabase
      .from('hms_personnel')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createPersonnel(personnel: any) {
    const { data, error } = await supabase
      .from('hms_personnel')
      .insert(personnel)
      .select()
      .single();
    return { data, error };
  },

  async updatePersonnel(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_personnel')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deletePersonnel(id: string) {
    const { data, error } = await supabase
      .from('hms_personnel')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Safety Representative Management
  async getSafetyRepresentative() {
    const { data, error } = await supabase
      .from('hms_safety_representative')
      .select('*')
      .order('appointed_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    return { data, error };
  },

  async createSafetyRepresentative(safetyRep: any) {
    const { data, error } = await supabase
      .from('hms_safety_representative')
      .insert(safetyRep)
      .select()
      .single();
    return { data, error };
  },

  async updateSafetyRepresentative(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_safety_representative')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Insurance Companies Management
  async getInsuranceCompanies() {
    const { data, error } = await supabase
      .from('hms_insurance_companies')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createInsuranceCompany(insurance: any) {
    const { data, error } = await supabase
      .from('hms_insurance_companies')
      .insert(insurance)
      .select()
      .single();
    return { data, error };
  },

  async updateInsuranceCompany(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_insurance_companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteInsuranceCompany(id: string) {
    const { data, error } = await supabase
      .from('hms_insurance_companies')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // First Aid Responsible Management
  async getFirstAidResponsible() {
    const { data, error } = await supabase
      .from('hms_first_aid_responsible')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return { data, error };
  },

  async createFirstAidResponsible(responsible: any) {
    const { data, error } = await supabase
      .from('hms_first_aid_responsible')
      .insert(responsible)
      .select()
      .single();
    return { data, error };
  },

  async updateFirstAidResponsible(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_first_aid_responsible')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // First Aid Equipment Management
  async getFirstAidEquipment() {
    const { data, error } = await supabase
      .from('hms_first_aid_equipment')
      .select('*')
      .order('equipment_name', { ascending: true });
    return { data, error };
  },

  async createFirstAidEquipment(equipment: any) {
    const { data, error } = await supabase
      .from('hms_first_aid_equipment')
      .insert(equipment)
      .select()
      .single();
    return { data, error };
  },

  async updateFirstAidEquipment(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_first_aid_equipment')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteFirstAidEquipment(id: string) {
    const { data, error } = await supabase
      .from('hms_first_aid_equipment')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // First Aid Inspections Management
  async getFirstAidInspections() {
    const { data, error } = await supabase
      .from('hms_first_aid_inspections')
      .select('*')
      .order('inspection_date', { ascending: false });
    return { data, error };
  },

  async createFirstAidInspection(inspection: any) {
    const { data, error } = await supabase
      .from('hms_first_aid_inspections')
      .insert(inspection)
      .select()
      .single();
    return { data, error };
  },

  async updateFirstAidInspection(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_first_aid_inspections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteFirstAidInspection(id: string) {
    const { data, error } = await supabase
      .from('hms_first_aid_inspections')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Risk Assessments
  async getRiskAssessments() {
    const { data, error } = await supabase
      .from('hms_risk_assessments')
      .select('*')
      .order('risk_score', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createRiskAssessment(assessment: any) {
    const { data, error } = await supabase
      .from('hms_risk_assessments')
      .insert(assessment)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateRiskAssessment(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_risk_assessments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRiskAssessment(id: string) {
    const { error } = await supabase
      .from('hms_risk_assessments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Work Environment
  async getWorkEnvironmentAssessments() {
    const { data, error } = await supabase
      .from('hms_work_environment_assessments')
      .select('*')
      .order('assessment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createWorkEnvironmentAssessment(assessment: any) {
    const { data, error } = await supabase
      .from('hms_work_environment_assessments')
      .insert(assessment)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateWorkEnvironmentAssessment(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_work_environment_assessments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getWorkEnvironmentItems(assessmentId: string) {
    const { data, error } = await supabase
      .from('hms_work_environment_items')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('category');
    if (error) throw error;
    return data;
  },

  async createWorkEnvironmentItemsBulk(items: any[]) {
    const { data, error } = await supabase
      .from('hms_work_environment_items')
      .insert(items)
      .select();
    if (error) throw error;
    return data;
  },

  async updateWorkEnvironmentItem(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_work_environment_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getWorkEnvironmentDeviations(assessmentId: string) {
    const { data, error } = await supabase
      .from('hms_work_environment_deviations')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createWorkEnvironmentDeviation(deviation: any) {
    const { data, error } = await supabase
      .from('hms_work_environment_deviations')
      .insert(deviation)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateWorkEnvironmentDeviation(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_work_environment_deviations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteWorkEnvironmentDeviation(id: string) {
    const { error } = await supabase
      .from('hms_work_environment_deviations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async deleteWorkEnvironmentAssessment(id: string) {
    const { error } = await supabase
      .from('hms_work_environment_assessments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Fire Safety
  async getFireResponsible() {
    const { data, error } = await supabase
      .from('hms_fire_responsible')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateFireResponsible(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_fire_responsible')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getFireEquipment() {
    const { data, error } = await supabase
      .from('hms_fire_equipment')
      .select('*')
      .order('equipment_type');
    if (error) throw error;
    return data;
  },

  async createFireEquipment(equipment: any) {
    const { data, error } = await supabase
      .from('hms_fire_equipment')
      .insert(equipment)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateFireEquipment(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_fire_equipment')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFireEquipment(id: string) {
    const { error } = await supabase
      .from('hms_fire_equipment')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getFireInspections() {
    const { data, error } = await supabase
      .from('hms_fire_inspections')
      .select('*')
      .order('inspection_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createFireInspection(inspection: any) {
    const { data, error } = await supabase
      .from('hms_fire_inspections')
      .insert(inspection)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateFireInspection(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_fire_inspections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFireInspection(id: string) {
    const { error } = await supabase
      .from('hms_fire_inspections')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getFireDocuments() {
    const { data, error } = await supabase
      .from('hms_fire_documents')
      .select('*')
      .order('document_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createFireDocument(document: any) {
    const { data, error } = await supabase
      .from('hms_fire_documents')
      .insert(document)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFireDocument(id: string) {
    const { error } = await supabase
      .from('hms_fire_documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getFireInstructions() {
    const { data, error } = await supabase
      .from('hms_fire_instructions')
      .select('*')
      .order('order_number');
    if (error) throw error;
    return data;
  },

  async getFireDeviations() {
    const { data, error } = await supabase
      .from('hms_fire_deviations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createFireDeviation(deviation: any) {
    const { data, error } = await supabase
      .from('hms_fire_deviations')
      .insert(deviation)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateFireDeviation(id: string, updates: any) {
    const { data, error } = await supabase
      .from('hms_fire_deviations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFireDeviation(id: string) {
    const { error } = await supabase
      .from('hms_fire_deviations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
