import { supabase as defaultSupabase } from './hmsSupabase';
import { SupabaseClient } from '@supabase/supabase-js';

export interface QueryWithCompany {
  companyId: string;
}

export class CompanyQueryBuilder {
  private companyId: string;
  private supabase: SupabaseClient;

  constructor(companyId: string, supabase: SupabaseClient = defaultSupabase) {
    this.companyId = companyId;
    this.supabase = supabase;
  }

  from(table: string) {
    return this.supabase.from(table);
  }

  select(table: string, columns = '*') {
    return this.supabase
      .from(table)
      .select(columns)
      .eq('company_id', this.companyId);
  }

  insert(table: string, data: any | any[]) {
    const dataWithCompanyId = Array.isArray(data)
      ? data.map(item => ({ ...item, company_id: this.companyId }))
      : { ...data, company_id: this.companyId };

    return this.supabase
      .from(table)
      .insert(dataWithCompanyId);
  }

  update(table: string, data: any) {
    return this.supabase
      .from(table)
      .update(data)
      .eq('company_id', this.companyId);
  }

  delete(table: string) {
    return this.supabase
      .from(table)
      .delete()
      .eq('company_id', this.companyId);
  }

  upsert(table: string, data: any | any[]) {
    const dataWithCompanyId = Array.isArray(data)
      ? data.map(item => ({ ...item, company_id: this.companyId }))
      : { ...data, company_id: this.companyId };

    return this.supabase
      .from(table)
      .upsert(dataWithCompanyId);
  }
}

export function createCompanyQuery(companyId: string) {
  return new CompanyQueryBuilder(companyId);
}
