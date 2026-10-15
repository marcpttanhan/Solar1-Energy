// Supabase connection for site content (see supabase_schema.sql for setup).
//
// Paste the values from Supabase → Project Settings → API:
//   url      the Project URL, e.g. https://abcdefghijkl.supabase.co
//   anonKey  the "anon" / "public" key
//
// Both are designed to be public: what the anon key can do is limited by the
// row-level security rules in supabase_schema.sql (read content only).
// Never put the service_role key here.
//
// While these are empty the site runs on its built-in content and the admin
// page explains how to connect.
window.SOLAR1_SUPABASE = {
  url: '',
  anonKey: '',
};
