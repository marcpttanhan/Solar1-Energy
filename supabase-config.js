// Supabase connection for site content (see supabase_schema.sql for setup).
//
// Paste the values from Supabase → Project Settings → API:
//   url      the Project URL, e.g. https://abcdefghijkl.supabase.co
//   anonKey  the legacy "anon" / "public" key (eyJ…) or the newer
//            publishable key (sb_publishable_…). Never a secret key.
//
// Both are designed to be public: what the anon key can do is limited by the
// row-level security rules in supabase_schema.sql (read content only).
// Never put the service_role key here.
//
// adminEmail: the Supabase Auth account the admin page signs in as when
// someone types the username "admin" (or "solar1"). Not a secret; the
// password lives only in Supabase. It must match the email in the write
// policies of supabase_schema.sql.
//
// While these are empty the site runs on its built-in content and the admin
// page explains how to connect.
window.SOLAR1_SUPABASE = {
  url: 'https://xhghsytjtuoohjwkhznh.supabase.co',
  adminEmail: 'admin@solar1energy.co.th',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZ2hzeXRqdHVvb2hqd2toem5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzIxMzAsImV4cCI6MjEwNzY0ODEzMH0.t9leh4AP4SrBOXGRJ4PUG0ADxz4JMw75SXJz_rAy5G4',
};
