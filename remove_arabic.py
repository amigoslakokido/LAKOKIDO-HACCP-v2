#!/usr/bin/env python3
import os
import re
import sys

# Common Arabic to English/Norwegian replacements
replacements = {
    # Loading/Progress messages
    'جاري التحميل...': '',
    'جاري التحميل': '',

    # UI Labels
    'التحليلات والرؤى الذكية': 'Analytics and Insights',
    'الاتجاه الأسبوعي': 'Weekly Trend',
    'التغيير الشهري': 'Monthly Change',
    'القضايا المحلولة': 'Resolved Cases',
    'الرؤى الذكية من الذكاء الاصطناعي': 'Smart Insights from AI',
    'الإسعافات الأولية': '',
    'شركات التأمين': '',
    'التقارير الرسمية': 'Official Reports',
    'التدريب على السلامة': 'Safety Training',
    'لا توجد تقارير بعد': 'No reports yet',
    'لا توجد جلسات تدريب مسجلة': 'No training sessions registered',
    'قائمة الموظفين': '',
    'الاسم': '',
    'الهاتف': '',
    'البريد': '',
    'الوظيفة': '',
    'القسم': '',
    'تاريخ التوظيف': '',
    'ملاحظات': '',
    'لا يوجد موظفون مسجلون': 'No employees registered',
    'الأحد': 'Sunday',
    'الإثنين': 'Monday',
    'الثلاثاء': 'Tuesday',
    'الأربعاء': 'Wednesday',
    'الخميس': 'Thursday',
    'الجمعة': 'Friday',
    'السبت': 'Saturday',
    'مندوب السلامة': '',
    'الاتفاقية والتعيين': '',
    'اختر موظف': 'Choose employee',
    'خطأ': 'Error',
    'التقدم': 'Progress',
    'المهمة': 'Task',
    'من': 'of',
    'تم الإنجاز': 'Completed',
    'من سيقوم بالمهمة؟': 'Who performs?',
    'ملاحظات (اختياري)': 'Notes (optional)',
    'اختر...': 'Choose...',
    'أضف ملاحظة...': 'Add note...',
    'تم ✅': 'Done ✅',
    'لم يتم ❌': 'Not done ❌',
    'معلومات الشركة': '',
    'لا توجد معلومات الشركة': 'No company information',
    'اسم الشركة': '',
    'المدير اليومي': '',
    'رقم الهاتف': '',
    'البريد الإلكتروني': '',
    'الموقع الرسمي': '',
    'العنوان': '',
    'التحول الأخضر': '',
    'رقم المنظمة': '',
    'إدارة المستندات': '',
    'الفلاتر': '',
    'بحث': '',
    'الملف': '',
    'العنوان': '',
    'الوصف': '',
    'الفئة': '',
    'تاريخ المستند': '',
    'رفع بواسطة': '',
    'لا توجد مستندات': 'No documents',
    'الصيانة': 'Maintenance',
    'التنظيف': 'Cleaning',
    'السلامة': 'Safety',
    'التدريب': 'Training',
    'العقود': 'Contracts',
    'الشهادات': 'Certificates',
    'التفتيش': 'Inspection',
    'التقارير': 'Reports',
    'أخرى': 'Other',
    'جرس': '',
    'صوت جرس ناعم وهادئ': 'Soft and gentle bell sound',
    'نغمة': '',
    'نغمة موسيقية لطيفة': 'Nice musical chime',
    'تنبيه': '',
    'صوت تنبيه واضح': 'Clear alert sound',
    'إنذار': '',
    'صوت إنذار قوي ومتكرر': 'Strong repetitive alarm',
    'لطيف': '',
    'صوت هادئ ولطيف جداً': 'Very quiet and gentle sound',
    'صفارة إنذار': '',
    'صفارة إنذار صاخبة ومتذبذبة': 'Loud oscillating siren',
    'عاجل': '',
    'صوت عاجل وصاخب جداً': 'Very urgent and loud sound',
    'صفير قوي': '',
    'صفير حاد وقوي': 'Sharp and strong whistle',
    'صوت بشري عربي': 'Arabic voice',
    'صوت بشري يقرأ التنبيه بالعربية': 'Human voice reading alert in Arabic',
    'تنبيه! يرجى إكمال المهام الروتينية اليومية': 'Alert! Please complete daily routine tasks',
    'طباخ، نادل، إلخ': 'Cook, Waiter, etc.',
    'الموظفين': 'Employees',
    'الدوام': 'Schedule',
    'المستندات': 'Documents',
    'رمز QR للموبايل': 'QR code for mobile',
    'رمز QR': 'QR code',
    'امسح الرمز لفتح التطبيق على الموبايل': 'Scan code to open app on mobile',
    'كيف تستخدم:': 'How to use:',
    'افتح كاميرا الموبايل': 'Open mobile camera',
    'امسح الرمز': 'Scan the code',
    'اضغط على الإشعار': 'Tap the notification',
    'الرابط:': 'Link:',
    'التحليلات': 'Analytics',
    'المهام اليومية': 'Daily tasks',
    'العربية': 'Arabic',
    'تقارير HACCP': 'HACCP Reports',
    'تقارير HMS': 'HMS Reports',
    'الحوادث الخطرة': 'Dangerous Incidents',
    'جميع التقارير في مكان واحد': 'All reports in one place',
    'تقارير المهام اليومية': 'Daily Task Reports',
    'تقارير الحوادث الخطرة': 'Dangerous Incident Reports',
    'لوحة التحكم': 'Dashboard',
    'آخر تحديث:': 'Last update:',
    'إجمالي الحوادث (7 أيام)': 'Total incidents (7 days)',
    'القضايا المفتوحة': 'Open cases',
    'الحوادث الحرجة': 'Critical incidents',
    'نظام متكامل للصحة والبيئة والسلامة وفقاً للوائح النرويجية': 'Integrated HMS system according to Norwegian regulations',
    'سجل الحوادث والانحرافات': 'Incident and Deviation Log',
    'الفئة': 'Category',
    'الخطورة': 'Severity',
    'منخفض': 'Low',
    'متوسط': 'Medium',
    'عالي': 'High',
    'حرج': 'Critical',
    'الموقع': 'Location',
    'الموظف': 'Employee',
    'الوصف': 'Description',
    'الإجراء الفوري': 'Immediate Action',
    'الإجراء الوقائي': 'Preventive Action',
    'لا توجد حوادث مسجلة بعد': 'No incidents registered yet',
    'مسؤول HMS': 'HMS Manager',
    'قائد الفريق': 'Team Leader',
    'موظفو التحضير': 'Preparation Staff',
    'سائقو التوصيل': 'Delivery Drivers',
    'الصيانة والمعدات': 'Maintenance and Equipment',
    'لا توجد أعمال صيانة مخطط لها': 'No scheduled maintenance',
    'جاري التحميل... Laster analyser...': 'Laster analyser...',
    'جاري التحميل... Laster opplæring...': 'Laster opplæring...',
    'جاري التحميل... Laster rapporter...': 'Laster rapporter...',
    'جاري التحميل... Laster...': 'Laster...',
    'جاري التحميل... Laster vedlikehold...': 'Laster vedlikehold...',
}

def remove_arabic_text(content):
    """Remove or replace Arabic text from file content"""
    # First do specific replacements
    for arabic, replacement in replacements.items():
        if arabic in content:
            if replacement:
                content = content.replace(f'{arabic} - ', '')
                content = content.replace(f' - {arabic}', '')
                content = content.replace(arabic, replacement)
            else:
                content = content.replace(f'{arabic} - ', '')
                content = content.replace(f' - {arabic}', '')
                content = content.replace(arabic, '')

    # Remove any remaining Arabic characters (as last resort)
    # This regex matches Arabic Unicode range
    arabic_pattern = re.compile(r'[\u0600-\u06FF]+')
    content = arabic_pattern.sub('', content)

    # Clean up any double spaces or dashes left behind
    content = re.sub(r'  +', ' ', content)
    content = re.sub(r' - +', '', content)
    content = re.sub(r'- +', '', content)

    return content

def process_file(filepath):
    """Process a single file to remove Arabic text"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if file contains Arabic
        if not re.search(r'[\u0600-\u06FF]', content):
            return False

        new_content = remove_arabic_text(content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}", file=sys.stderr)
        return False

def main():
    src_dir = 'src'
    modified_files = []

    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    modified_files.append(filepath)

    print(f"Modified {len(modified_files)} files:")
    for file in modified_files:
        print(f"  - {file}")

if __name__ == '__main__':
    main()
