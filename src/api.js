import { supabase } from './supabase.js';

// --- TODOS ---
export async function getTodos() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];
    
    let { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });
    
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
        .order('created_at', { ascending: false });
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

export async function addRun(date, distance, duration, notes) {
    const { data: session } = await supabase.auth.getSession();
    const { data, error } = await supabase
        .from('runs')
        .insert([{ date, distance, duration, notes, user_id: session.session.user.id }])
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
