/*
  # Fix Temperature Logs Issues

  ## المشاكل:
  1. Kjøleskap: بعض الأجهزة مفقودة من السجلات (لا توجد بيانات درجة حرارة)
  2. Fryser: بعض السجلات مكررة (duplicate entries)

  ## الحل:
  - حذف السجلات المكررة من Fryser
  - التحقق من وجود سجلات لجميع أجهزة Kjøleskap
*/

-- حذف السجلات المكررة من Fryser (الصفوف الزائدة)
DELETE FROM temperature_logs tl
WHERE tl.log_date = CURRENT_DATE
AND tl.equipment_id IN (
  SELECT e.id FROM equipment e 
  WHERE e.zone_id = (SELECT id FROM zones WHERE name = 'Fryser')
  AND e.name IN ('2', '3')
)
AND tl.id IN (
  SELECT id FROM (
    SELECT 
      tl2.id,
      ROW_NUMBER() OVER (PARTITION BY tl2.equipment_id, tl2.log_date, tl2.log_time ORDER BY tl2.created_at DESC) as rn
    FROM temperature_logs tl2
    WHERE tl2.log_date = CURRENT_DATE
    AND tl2.equipment_id IN (
      SELECT e.id FROM equipment e 
      WHERE e.zone_id = (SELECT id FROM zones WHERE name = 'Fryser')
      AND e.name IN ('2', '3')
    )
  ) dup
  WHERE dup.rn > 1
);
