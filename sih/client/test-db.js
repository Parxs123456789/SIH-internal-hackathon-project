import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ottkmztdxixelqzroahp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dGttenRkeGl4ZWxxenJvYWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNTk0NTEsImV4cCI6MjEwNTkzNTQ1MX0.NLpjaa_cQlmsEZ52mVTCi_0yqSTC1SPDpEQsVbEIrTc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("Error querying profiles:", error);
  } else {
    console.log("Profiles query success:", data);
  }
}

test();
