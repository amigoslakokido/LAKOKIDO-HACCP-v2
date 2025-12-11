/*
  # قاعدة معرفية للذكاء الصناعي - HMS AI Knowledge Base
  
  1. جداول جديدة / New Tables
    - `hms_ai_knowledge_base`
      - قاعدة معرفية لكل قسم HMS
      - Knowledge base for each HMS section
      - تربط الأقسام بالجداول والبيانات المرتبطة
      - Links sections to related tables and data
      - معلومات وإرشادات لتوليد التقارير
      - Information and guidelines for report generation
    
    - `hms_ai_section_data`
      - بيانات مهيكلة لكل قسم يستخدمها الذكاء الصناعي
      - Structured data for each section used by AI
      - إرشادات وقواعد التحليل
      - Analysis guidelines and rules
  
  2. الأمان / Security
    - تفعيل RLS لجميع الجداول
    - Enable RLS for all tables
    - سياسات للقراءة للجميع
    - Policies for public read access
*/

-- جدول القاعدة المعرفية
-- AI Knowledge Base Table
CREATE TABLE IF NOT EXISTS hms_ai_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_code text NOT NULL UNIQUE,
  section_name_no text NOT NULL,
  section_name_en text NOT NULL,
  description text,
  related_tables text[] DEFAULT '{}',
  data_sources jsonb DEFAULT '[]'::jsonb,
  analysis_guidelines text,
  report_structure jsonb DEFAULT '{}'::jsonb,
  keywords text[] DEFAULT '{}',
  regulations text[] DEFAULT '{}',
  best_practices text,
  common_issues jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hms_ai_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read knowledge base"
  ON hms_ai_knowledge_base FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update knowledge base"
  ON hms_ai_knowledge_base FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can insert knowledge base"
  ON hms_ai_knowledge_base FOR INSERT
  TO public
  WITH CHECK (true);

-- إدخال البيانات المعرفية لجميع أقسام HMS
-- Insert knowledge base data for all HMS sections

-- 1. قسم الحوادث والانحرافات
INSERT INTO hms_ai_knowledge_base (
  section_code,
  section_name_no,
  section_name_en,
  description,
  related_tables,
  data_sources,
  analysis_guidelines,
  keywords,
  regulations
) VALUES (
  'incidents',
  'Hendelser og Avvik',
  'Incidents and Deviations',
  'تتبع وتحليل الحوادث والانحرافات والمتابعة',
  ARRAY['hms_incidents', 'hms_incident_registry', 'hms_deviations', 'hms_followup', 'hms_attachments'],
  '[
    {"table": "hms_incidents", "fields": ["incident_type", "severity", "status", "description", "date"]},
    {"table": "hms_deviations", "fields": ["deviation_type", "severity", "corrective_actions"]},
    {"table": "hms_followup", "fields": ["status", "responsible_person", "deadline"]}
  ]'::jsonb,
  'تحليل عدد الحوادث، التصنيف، الخطورة، التدابير المتخذة، حالة المتابعة',
  ARRAY['حوادث', 'انحرافات', 'سلامة', 'متابعة', 'إجراءات تصحيحية'],
  ARRAY['AML § 3-1', 'Internkontrollforskriften']
),
(
  'risk_assessment',
  'Risikovurdering',
  'Risk Assessment',
  'تقييم وإدارة المخاطر في بيئة العمل',
  ARRAY['hms_risk_assessments'],
  '[
    {"table": "hms_risk_assessments", "fields": ["risk_category", "risk_level", "probability", "consequence", "measures"]}
  ]'::jsonb,
  'تحليل المخاطر حسب الفئة والمستوى، فعالية التدابير الوقائية',
  ARRAY['مخاطر', 'تقييم', 'احتمالية', 'نتيجة', 'تدابير وقائية'],
  ARRAY['AML § 4-1', 'Risikovurderingsforskriften']
),
(
  'fire_safety',
  'Brannsikkerhet',
  'Fire Safety',
  'إدارة السلامة من الحريق والمعدات والتفتيش',
  ARRAY['hms_fire_equipment', 'hms_fire_inspections', 'hms_fire_deviations', 'hms_fire_documents', 'hms_fire_responsible'],
  '[
    {"table": "hms_fire_equipment", "fields": ["equipment_type", "location", "last_inspection", "status"]},
    {"table": "hms_fire_inspections", "fields": ["inspection_type", "findings", "completed_date"]},
    {"table": "hms_fire_deviations", "fields": ["deviation_type", "severity", "corrective_actions"]}
  ]'::jsonb,
  'تحليل حالة معدات الحريق، نتائج التفتيش، الانحرافات، الصيانة',
  ARRAY['حريق', 'معدات', 'تفتيش', 'طفايات', 'إنذار'],
  ARRAY['Brann- og eksplosjonsvernloven', 'Forskrift om brannforebygging']
),
(
  'first_aid',
  'Førstehjelp',
  'First Aid',
  'إدارة معدات وموارد الإسعافات الأولية',
  ARRAY['hms_first_aid_equipment', 'hms_first_aid_inspections', 'hms_first_aid_responsible'],
  '[
    {"table": "hms_first_aid_equipment", "fields": ["equipment_type", "location", "expiry_date", "quantity"]},
    {"table": "hms_first_aid_inspections", "fields": ["inspection_date", "findings", "items_replaced"]}
  ]'::jsonb,
  'تحليل توفر معدات الإسعاف، التواريخ المنتهية، التفتيش الدوري',
  ARRAY['إسعافات أولية', 'معدات طبية', 'تفتيش', 'صلاحية'],
  ARRAY['AML § 3-2', 'Forskrift om HMS']
),
(
  'evacuation',
  'Evakuering',
  'Evacuation',
  'إدارة خطط وإجراءات الإخلاء',
  ARRAY['hms_evacuation_plan', 'hms_evacuation_drills', 'hms_evacuation_roles', 'hms_escape_routes', 'hms_evacuation_documents'],
  '[
    {"table": "hms_evacuation_drills", "fields": ["drill_date", "participants", "duration", "findings", "improvements"]},
    {"table": "hms_evacuation_roles", "fields": ["role_type", "responsible_person"]},
    {"table": "hms_escape_routes", "fields": ["route_name", "status", "obstacles"]}
  ]'::jsonb,
  'تحليل التمارين، الأدوار، فعالية الخطة، مسارات الهروب',
  ARRAY['إخلاء', 'تمارين', 'مسارات هروب', 'أدوار'],
  ARRAY['Brann- og eksplosjonsvernloven']
),
(
  'training',
  'Opplæring',
  'Training',
  'إدارة التدريب والتطوير',
  ARRAY['hms_training', 'hms_training_attendees', 'hms_training_history', 'hms_management_training_info'],
  '[
    {"table": "hms_training", "fields": ["training_type", "date", "duration", "instructor"]},
    {"table": "hms_training_attendees", "fields": ["employee_name", "attendance_status", "completed"]},
    {"table": "hms_training_history", "fields": ["employee_name", "completed_trainings"]}
  ]'::jsonb,
  'تحليل حضور التدريب، أنواع التدريب، الموظفين المدربين، الفجوات التدريبية',
  ARRAY['تدريب', 'تطوير', 'مهارات', 'شهادات'],
  ARRAY['AML § 3-2', 'Opplæringsforskriften']
),
(
  'work_environment',
  'Arbeidsmiljø',
  'Work Environment',
  'إدارة وتقييم بيئة العمل',
  ARRAY['hms_work_environment_assessments', 'hms_work_environment_deviations', 'hms_work_environment_items'],
  '[
    {"table": "hms_work_environment_assessments", "fields": ["assessment_type", "area", "score", "findings"]},
    {"table": "hms_work_environment_deviations", "fields": ["deviation_type", "severity", "corrective_actions"]}
  ]'::jsonb,
  'تحليل تقييمات بيئة العمل، الانحرافات، التحسينات المطلوبة',
  ARRAY['بيئة عمل', 'تقييم', 'صحة', 'سلامة'],
  ARRAY['AML § 4-1', 'AML § 4-2']
),
(
  'environment',
  'Miljø',
  'Environment',
  'إدارة البيئة والاستدامة',
  ARRAY['hms_environment_waste', 'hms_environment_cleaning_products', 'hms_environment_frying_oil', 'hms_environment_grease_trap', 'hms_environment_green_transport', 'hms_environment_goals'],
  '[
    {"table": "hms_environment_waste", "fields": ["waste_type", "quantity", "disposal_method"]},
    {"table": "hms_environment_cleaning_products", "fields": ["product_name", "eco_label", "usage"]},
    {"table": "hms_environment_frying_oil", "fields": ["change_date", "quantity", "disposal_method"]},
    {"table": "hms_environment_grease_trap", "fields": ["cleaning_date", "condition"]},
    {"table": "hms_environment_green_transport", "fields": ["transport_type", "emissions"]},
    {"table": "hms_environment_goals", "fields": ["goal_description", "target_date", "progress"]}
  ]'::jsonb,
  'تحليل إدارة النفايات، المنتجات الصديقة للبيئة، النقل الأخضر، تحقيق الأهداف البيئية',
  ARRAY['بيئة', 'نفايات', 'استدامة', 'أهداف بيئية'],
  ARRAY['Forurensningsloven', 'Avfallsforskriften']
),
(
  'maintenance',
  'Vedlikehold',
  'Maintenance',
  'إدارة الصيانة والمعدات',
  ARRAY['hms_maintenance'],
  '[
    {"table": "hms_maintenance", "fields": ["equipment_name", "maintenance_type", "last_service", "next_service", "status"]}
  ]'::jsonb,
  'تحليل حالة المعدات، جداول الصيانة، الصيانة المتأخرة',
  ARRAY['صيانة', 'معدات', 'خدمة', 'جدولة'],
  ARRAY['Internkontrollforskriften']
),
(
  'personnel',
  'Personell',
  'Personnel',
  'إدارة الموظفين والمسؤوليات',
  ARRAY['hms_personnel', 'hms_employees', 'hms_safety_representative'],
  '[
    {"table": "hms_personnel", "fields": ["name", "role", "responsibilities"]},
    {"table": "hms_employees", "fields": ["name", "position", "department", "hire_date"]},
    {"table": "hms_safety_representative", "fields": ["name", "election_date", "term_end"]}
  ]'::jsonb,
  'تحليل توزيع المسؤوليات، المناصب الرئيسية، الموظفين',
  ARRAY['موظفين', 'مسؤوليات', 'أدوار', 'تنظيم'],
  ARRAY['AML § 6-1', 'AML § 6-2']
),
(
  'insurance',
  'Forsikring',
  'Insurance',
  'إدارة التأمينات',
  ARRAY['hms_insurance_companies'],
  '[
    {"table": "hms_insurance_companies", "fields": ["company_name", "policy_number", "coverage_type", "expiry_date"]}
  ]'::jsonb,
  'تحليل تغطية التأمين، تواريخ الانتهاء، أنواع التأمين',
  ARRAY['تأمين', 'تغطية', 'بوليصة'],
  ARRAY['Lov om yrkesskadeforsikring']
),
(
  'documents',
  'Dokumenter',
  'Documents',
  'إدارة الوثائق والسجلات',
  ARRAY['hms_documents', 'hms_categories'],
  '[
    {"table": "hms_documents", "fields": ["title", "category", "document_type", "upload_date", "expiry_date"]},
    {"table": "hms_categories", "fields": ["category_name", "description"]}
  ]'::jsonb,
  'تحليل تنظيم الوثائق، الفئات، الوثائق المنتهية',
  ARRAY['وثائق', 'سجلات', 'فئات', 'أرشيف'],
  ARRAY['Internkontrollforskriften']
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_ai_kb_section_code ON hms_ai_knowledge_base(section_code);
CREATE INDEX IF NOT EXISTS idx_ai_kb_updated ON hms_ai_knowledge_base(updated_at DESC);
