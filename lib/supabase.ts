import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ibblvitcyzeqpywwllqe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliYmx2aXRjeXplcXB5d3dsbHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NDIxNzUsImV4cCI6MjEwODMxODE3NX0.lLVzGU-YG_FCMIEn6mjrUZnR7fcdfa5VNeacPd5QBMY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
