import { supabase } from '../supabase.js';

export function renderNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'animate-fade-in';
    
    const brand = document.createElement('div');
    brand.className = 'nav-brand';
    brand.textContent = 'Dashboard';
    
    const linksContainer = document.createElement('div');
    linksContainer.className = 'nav-links';
    
    const links = [
        { name: 'Todo', hash: '#/' },
        { name: 'Links', hash: '#/links' },
        { name: 'Runs', hash: '#/runs' },
        { name: 'Calendar', hash: '#/calendar' }
    ];
    
    links.forEach(linkInfo => {
        const a = document.createElement('a');
        a.href = linkInfo.hash;
        a.textContent = linkInfo.name;
        // active state gets set in main.js routing
        a.id = `nav-${linkInfo.name.toLowerCase()}`;
        linksContainer.appendChild(a);
    });
    
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = async () => {
        await supabase.auth.signOut();
        window.location.hash = '#/';
    };
    linksContainer.appendChild(logoutBtn);
    
    nav.appendChild(brand);
    nav.appendChild(linksContainer);
    
    return nav;
}
