import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://nzmkosvddcabnfovadnz.supabase.co';
const supabaseKey = 'sb_publishable_NgxqsXciJOb49tQqKJ7kiA_xGT7jN99';

export const supabase = createClient(supabaseUrl, supabaseKey);
