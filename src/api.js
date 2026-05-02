import { supabase } from './supabase.js';

// --- TODOS ---
export async function getTodos() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];
    
    let { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });
    
    if (error) console.error(error);
    return data || [];
}

export async function addTodo(title, due_date) {
    const { data: session } = await supabase.auth.getSession();
    const payload = { title, user_id: session.session.user.id };
    if (due_date) payload.due_date = due_date;
    
    const { data, error } = await supabase
        .from('todos')
        .insert([payload])
        .select();
    if (error) console.error(error);
    return data;
}

export async function toggleTodo(id, is_completed) {
    const { data, error } = await supabase
        .from('todos')
        .update({ is_completed: !is_completed })
        .eq('id', id)
        .select();
    if (error) console.error(error);
    return data;
}

export async function deleteTodo(id) {
    const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
    if (error) console.error(error);
}

// --- LINKS ---
export async function getLinks() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];
    
    let { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: true });
    if (error) console.error(error);
    return data || [];
}

export async function addLink(title, url) {
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase
        .from('links')
        .insert([{ title, url, user_id: session.session.user.id }])
        .select();
    if (error) console.error(error);
    return data;
}

export async function deleteLink(id) {
    const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);
    if (error) console.error(error);
}

// --- RUNS ---
export async function getRuns() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];
    
    let { data, error } = await supabase
        .from('runs')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('date', { ascending: false });
    if (error) console.error(error);
    return data || [];
}

export async function addRun(date, distance, duration, notes, details = null) {
    const { data: session } = await supabase.auth.getSession();
    const payload = { date, distance, duration, notes, user_id: session.session.user.id };
    if (details) payload.details = details;
    
    const { data, error } = await supabase
        .from('runs')
        .insert([payload])
        .select();
    if (error) console.error(error);
    return data;
}

export async function deleteRun(id) {
    const { error } = await supabase
        .from('runs')
        .delete()
        .eq('id', id);
    if (error) console.error(error);
}

// --- MEMOS ---
export async function getMemos() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];
    
    let { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('date', { ascending: false });
    if (error) console.error(error);
    return data || [];
}

export async function addMemo(date, content) {
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase
        .from('memos')
        .insert([{ date, content, user_id: session.session.user.id }])
        .select();
    if (error) console.error(error);
    return data;
}

export async function deleteMemo(id) {
    const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id);
    if (error) console.error(error);
}

// --- DASHBOARD CONFIG ---
export async function getDashboardConfig() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return { layout: ['tasks', 'links', 'runs', 'calendar'] };
    
    let { data, error } = await supabase
        .from('dashboard_config')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();
        
    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
        console.error(error);
    }
    
    return data || { layout: ['tasks', 'links', 'runs', 'calendar'] };
}

export async function setDashboardConfig(layout) {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return null;
    
    // UPSERT doesn't work out of the box with default setup without proper primary keys/unique constraints
    // But user_id is unique so we can try to find first, then insert/update
    const { data: existing } = await supabase
        .from('dashboard_config')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();
        
    if (existing) {
        const { data, error } = await supabase
            .from('dashboard_config')
            .update({ layout, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select();
        if (error) console.error(error);
        return data;
    } else {
        const { data, error } = await supabase
            .from('dashboard_config')
            .insert([{ layout, user_id: session.session.user.id }])
            .select();
        if (error) console.error(error);
        return data;
    }
}
