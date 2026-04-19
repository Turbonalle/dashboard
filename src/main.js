import { supabase } from './supabase.js';
import { renderNavbar } from './components/navbar.js';
import { renderAuth } from './pages/auth.js';
import { renderTodo } from './pages/todo.js';
import { renderLinks } from './pages/links.js';
import { renderRunningLog } from './pages/runningLog.js';
import { renderCalendar } from './pages/calendar.js';

const app = document.getElementById('app');
let session = null;

async function checkSession() {
    const { data } = await supabase.auth.getSession();
    session = data.session;
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, _session) => {
        session = _session;
        router();
    });
}

async function renderPage(hash) {
    if (!session) {
        return renderAuth();
    }
    
    switch(hash) {
        case '':
        case '#/':
            return await renderTodo();
        case '#/links':
            return await renderLinks();
        case '#/runs':
            return await renderRunningLog();
        case '#/calendar':
            return await renderCalendar();
        default:
            // 404 fallback
            return await renderTodo();
    }
}

async function router() {
    app.innerHTML = '';
    
    // Add navbar if logged in
    if (session) {
        app.appendChild(renderNavbar());
        
        // Set active link in navbar based on hash
        const hash = window.location.hash || '#/';
        const links = app.querySelectorAll('.nav-links a');
        links.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Add main content
    const content = await renderPage(window.location.hash);
    app.appendChild(content);
}

// Initialize
window.addEventListener('hashchange', router);

async function init() {
    app.innerHTML = '<div class="container" style="display:flex; justify-content:center; align-items:center; height:100vh;"><span class="loader"></span></div>';
    await checkSession();
    router();
}

init();
