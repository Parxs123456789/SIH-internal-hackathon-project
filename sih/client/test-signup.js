import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ottkmztdxixelqzroahp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dGttenRkeGl4ZWxxenJvYWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNTk0NTEsImV4cCI6MjEwNTkzNTQ1MX0.NLpjaa_cQlmsEZ52mVTCi_0yqSTC1SPDpEQsVbEIrTc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  const testEmail = `test${Date.now()}@example.com`;
  console.log("Signing up user:", testEmail);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123'
  });

  if (error) {
    console.error("Signup error:", error);
    return;
  }
  
  console.log("Signup success! User:", data.user?.id);

  console.log("Inserting profile...");
  const { error: profileError } = await supabase.from('profiles').insert([
    { id: data.user.id, role: 'caretaker', associated_email: testEmail }
  ]);

  if (profileError) {
    console.error("Profile insert error:", profileError);
  } else {
    console.log("Profile insert success!");
  }
}

testSignup();
