import { getRuns, addRun, deleteRun } from '../api.js';

export async function renderRunningLog() {
    const container = document.createElement('div');
    container.className = 'container animate-fade-in';
    
    const header = document.createElement('div');
    header.className = 'page-header';
    const title = document.createElement('h1');
    title.className = 'page-title';
    title.textContent = 'Running Log';
    const desc = document.createElement('p');
    desc.className = 'page-description';
    desc.textContent = 'Track your distance and pace over time.';
    header.appendChild(title);
    header.appendChild(desc);
    
    // Form
    const addCard = document.createElement('div');
    addCard.className = 'glass-card';
    addCard.style.marginBottom = '2rem';
    
    const form = document.createElement('form');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr 1fr 1fr';
    form.style.gap = '1rem';
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.required = true;
    // Set default to today
    dateInput.value = new Date().toISOString().split('T')[0];
    
    const distanceInput = document.createElement('input');
    distanceInput.type = 'number';
    distanceInput.step = '0.01';
    distanceInput.placeholder = 'Distance (km/miles)';
    distanceInput.required = true;
    
    const durationInput = document.createElement('input');
    durationInput.type = 'text';
    durationInput.placeholder = 'Duration (e.g. 45m or 1h 10m)';
    durationInput.required = true;
    
    const notesInput = document.createElement('input');
    notesInput.type = 'text';
    notesInput.placeholder = 'Notes (How did it feel?)';
    notesInput.style.gridColumn = '1 / span 2';
    
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'btn-primary';
    btn.textContent = 'Log Run';
    
    form.appendChild(dateInput);
    form.appendChild(distanceInput);
    form.appendChild(durationInput);
    form.appendChild(notesInput);
    form.appendChild(btn);
    addCard.appendChild(form);
    
    // Stats overview (simple for now)
    const statsCard = document.createElement('div');
    statsCard.className = 'glass-card';
    statsCard.style.marginBottom = '2rem';
    statsCard.style.display = 'flex';
    statsCard.style.justifyContent = 'space-around';
    
    const stat1 = document.createElement('div');
    stat1.style.textAlign = 'center';
    stat1.innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem">Total Distance</div><div id="stat-dist" style="font-size:2rem; font-weight:700; color:var(--accent-primary)">-</div>';
    
    const stat2 = document.createElement('div');
    stat2.style.textAlign = 'center';
    stat2.innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem">Total Runs</div><div id="stat-count" style="font-size:2rem; font-weight:700; color:var(--accent-secondary)">-</div>';
    
    statsCard.appendChild(stat1);
    statsCard.appendChild(stat2);
    
    // List
    const listCard = document.createElement('div');
    listCard.className = 'glass-card';
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `
        <thead>
            <tr style="text-align:left; border-bottom:1px solid var(--glass-border);">
                <th style="padding:1rem;">Date</th>
                <th style="padding:1rem;">Distance</th>
                <th style="padding:1rem;">Duration</th>
                <th style="padding:1rem;">Notes</th>
                <th style="padding:1rem;">Actions</th>
            </tr>
        </thead>
        <tbody id="runs-tbody">
            <tr><td colspan="5" style="text-align:center; padding:2rem;"><span class="loader"></span></td></tr>
        </tbody>
    `;
    listCard.appendChild(table);
    
    container.appendChild(header);
    container.appendChild(statsCard);
    container.appendChild(addCard);
    container.appendChild(listCard);
    
    // Logic
    const loadRuns = async () => {
        const tbody = table.querySelector('#runs-tbody');
        const runs = await getRuns();
        tbody.innerHTML = '';
        
        if (runs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">No runs logged yet. Get out there!</td></tr>';
            container.querySelector('#stat-dist').textContent = '0.00';
            container.querySelector('#stat-count').textContent = '0';
            return;
        }
        
        // Calculate stats
        let totalDist = 0;
        runs.forEach(r => totalDist += parseFloat(r.distance || 0));
        container.querySelector('#stat-dist').textContent = totalDist.toFixed(2);
        container.querySelector('#stat-count').textContent = runs.length;
        
        runs.forEach(run => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            
            tr.innerHTML = `
                <td style="padding:1rem;">${new Date(run.date).toLocaleDateString()}</td>
                <td style="padding:1rem; font-weight:600;">${run.distance}</td>
                <td style="padding:1rem;">${run.duration}</td>
                <td style="padding:1rem; color:var(--text-muted)">${run.notes || '-'}</td>
            `;
            
            const actionsTd = document.createElement('td');
            actionsTd.style.padding = '1rem';
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-danger';
            delBtn.textContent = 'Delete';
            delBtn.onclick = async () => {
                tr.style.opacity = '0.5';
                await deleteRun(run.id);
                loadRuns();
            };
            actionsTd.appendChild(delBtn);
            tr.appendChild(actionsTd);
            
            tbody.appendChild(tr);
        });
    };
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        btn.disabled = true;
        
        await addRun(dateInput.value, distanceInput.value, durationInput.value, notesInput.value);
        
        distanceInput.value = '';
        durationInput.value = '';
        notesInput.value = '';
        btn.disabled = false;
        
        await loadRuns();
    };
    
    loadRuns();
    
    return container;
}
