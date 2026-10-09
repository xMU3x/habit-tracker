# إعداد Supabase + Cloudflare Pages

## 1) الجدول (SQL Editor في Supabase)
```sql
create table if not exists public.kv_store (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);
alter table public.kv_store enable row level security;
```
(الوصول يتم من Functions بمفتاح السيرفر، فلا حاجة لسياسات عامة.)

## 2) متغيرات البيئة (Cloudflare Pages > Settings > Environment variables)
- `SUPABASE_URL`  (مثال: https://xxxx.supabase.co)
- `SUPABASE_SECRET_KEY`  (service_role / secret key)

## 3) الرفع
ارفع محتويات هذا المجلد كما هي (index.html و functions/ و icons/ ...) إلى Cloudflare Pages.
اختبر: `/api/health` ثم `/api/data?key=adhkarSections`.

## مفاتيح البيانات المستخدمة
habits, records-YYYY-MM-DD, fastDays, quranData, tasks, courses, lectureProgress, activityLog, adhkarSections
(نفس مفاتيح التطبيق القديم، فبياناتك الحالية تظهر مباشرة بما فيها الأذكار.)
