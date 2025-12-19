import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'staff';
  created_at: string;
  updated_at: string;
};

export type Zone = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type Equipment = {
  id: string;
  name: string;
  type: 'refrigerator' | 'freezer' | 'other';
  zone_id: string | null;
  min_temp: number;
  max_temp: number;
  active: boolean;
  created_at: string;
};

export type TemperatureLog = {
  id: string;
  equipment_id: string;
  temperature: number;
  status: 'safe' | 'warning' | 'danger';
  recorded_by: string;
  log_date: string;
  log_time: string;
  notes: string;
  created_at: string;
};

export type CleaningTask = {
  id: string;
  zone_id: string | null;
  task_name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  active: boolean;
  created_at: string;
};

export type CleaningLog = {
  id: string;
  task_id: string;
  completed_by: string;
  log_date: string;
  log_time: string;
  status: 'completed' | 'incomplete' | 'skipped';
  notes: string;
  created_at: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  active: boolean;
  created_at: string;
};

export type IncidentAttachment = {
  id: string;
  incident_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
};

export type TemperatureZone = Zone;
export type TemperatureItem = Equipment;
