import { supabase } from './supabase';

async function verify() {
    console.log('Verifying Supabase connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    // Don't log the key fully, just the start
    console.log('Key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 5));

    try {
        const { data, error } = await supabase.from('documents').select('*').limit(1);

        if (error) {
            console.error('❌ Error accessing documents table.');
            console.error('Error object:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Connected to Supabase and found "documents" table.');
            console.log('Data sample:', data);
        }
    } catch (e) {
        console.error('❌ Exception:', e);
    }
}

verify();
