import { getLinks, addLink, deleteLink } from '../api.js';

export async function renderLinks() {
    const container = document.createElement('div');
    container.className = 'container animate-fade-in';
    
    const header = document.createElement('div');
    header.className = 'page-header';
    const title = document.createElement('h1');
    title.className = 'page-title';
    title.textContent = 'Bookmarks';
    const desc = document.createElement('p');
    desc.className = 'page-description';
    desc.textContent = 'Save your most important links.';
    header.appendChild(title);
    header.appendChild(desc);
    
    // Add form
    const addCard = document.createElement('div');
    addCard.className = 'glass-card';
    addCard.style.marginBottom = '2rem';
    
    const form = document.createElement('form');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr 2fr auto';
    form.style.gap = '1rem';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Link Title';
    titleInput.required = true;
    
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.placeholder = 'https://example.com';
    urlInput.required = true;
    
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'btn-primary';
    btn.textContent = 'Save Link';
    
    form.appendChild(titleInput);
    form.appendChild(urlInput);
    form.appendChild(btn);
    addCard.appendChild(form);
    
    // List
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    gridContainer.style.gap = '1.5rem';
    
    const loader = document.createElement('span');
    loader.className = 'loader';
    gridContainer.appendChild(loader);
    
    container.appendChild(header);
    container.appendChild(addCard);
    container.appendChild(gridContainer);
    
    // Logic
    const loadLinks = async () => {
        const links = await getLinks();
        gridContainer.innerHTML = '';
        if (links.length === 0) {
            gridContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); grid-column: 1/-1;">No links saved yet.</p>';
            return;
        }
        
        links.forEach(link => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.display = 'flex';
            card.style.flexDirection = 'row';
            card.style.justifyContent = 'space-between';
            card.style.padding = '1rem';
            
            const content = document.createElement('div');
            const linkTitle = document.createElement('a');
            linkTitle.href = link.url;
            linkTitle.target = '_blank';
            linkTitle.textContent = link.title;
            linkTitle.style.color = 'var(--accent-primary)';
            linkTitle.style.textDecoration = 'none';
            linkTitle.style.wordBreak = 'break-all';
            linkTitle.style.fontSize = '1.2rem';
            content.appendChild(linkTitle);
            
            const actions = document.createElement('div');
            actions.style.textAlign = 'right';
            
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-danger';
            delBtn.textContent = 'x';
            delBtn.onclick = async () => {
                card.style.opacity = '0.5';
                await deleteLink(link.id);
                card.remove();
                if (gridContainer.children.length === 0) loadLinks();
            };
            
            actions.appendChild(delBtn);
            card.appendChild(content);
            card.appendChild(actions);
            gridContainer.appendChild(card);
        });
    };
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        const t = titleInput.value;
        const u = urlInput.value;
        titleInput.disabled = true;
        urlInput.disabled = true;
        btn.disabled = true;
        
        await addLink(t, u);
        
        titleInput.value = '';
        urlInput.value = '';
        titleInput.disabled = false;
        urlInput.disabled = false;
        btn.disabled = false;
        
        await loadLinks();
    };
    
    loadLinks();
    
    return container;
}
