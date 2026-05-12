import { getRuns, addRun, deleteRun } from '../api.js';
import { formatDuration } from '../utils.js';

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
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '1rem';
    
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.gap = '1rem';
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.required = true;
    dateInput.value = new Date().toISOString().split('T')[0];
    dateInput.style.flex = '1';
    
    const notesInput = document.createElement('input');
    notesInput.type = 'text';
    notesInput.placeholder = 'Notes (Overall session)';
    notesInput.style.flex = '2';
    
    topRow.appendChild(dateInput);
    topRow.appendChild(notesInput);
    form.appendChild(topRow);
    
    const runsContainer = document.createElement('div');
    runsContainer.style.display = 'flex';
    runsContainer.style.flexDirection = 'column';
    runsContainer.style.gap = '0.5rem';
    
    const addRunRow = () => {
        const row = document.createElement('div');
        row.className = 'run-input-row';
        row.style.display = 'flex';
        row.style.gap = '1rem';
        
        const dist = document.createElement('input');
        dist.type = 'number';
        dist.step = '0.01';
        dist.placeholder = 'Distance (km/miles)';
        dist.required = true;
        dist.style.flex = '1';
        
        const hours = document.createElement('input');
        hours.type = 'text';
        hours.placeholder = 'Hours';
        hours.required = false;
        hours.style.flex = '1';

        const minutes = document.createElement('input');
        minutes.type = 'text';
        minutes.placeholder = 'Minutes';
        minutes.required = false;
        minutes.style.flex = '1';

        const seconds = document.createElement('input');
        seconds.type = 'text';
        seconds.placeholder = 'Seconds';
        seconds.required = false;
        seconds.style.flex = '1';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.className = 'btn-danger';
        removeBtn.style.padding = '0 0.5rem';
        removeBtn.onclick = () => {
            if (runsContainer.children.length > 1) {
                runsContainer.removeChild(row);
            }
        };
        
        row.appendChild(dist);
        row.appendChild(hours);
        row.appendChild(minutes);
        row.appendChild(seconds);
        row.appendChild(removeBtn);
        runsContainer.appendChild(row);
    };
    
    // Add first row
    addRunRow();
    
    form.appendChild(runsContainer);
    
    const actionsRow = document.createElement('div');
    actionsRow.style.display = 'flex';
    actionsRow.style.justifyContent = 'space-between';
    
    const addMoreBtn = document.createElement('button');
    addMoreBtn.type = 'button';
    addMoreBtn.textContent = '+ Add Run';
    addMoreBtn.className = 'btn-secondary';
    addMoreBtn.onclick = addRunRow;
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn-primary';
    submitBtn.textContent = 'Log Session';
    
    actionsRow.appendChild(addMoreBtn);
    actionsRow.appendChild(submitBtn);
    form.appendChild(actionsRow);
    
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
                <th style="padding:1rem;">Actions</th>
            </tr>
        </thead>
        <tbody id="runs-tbody">
            <tr><td colspan="4" style="text-align:center; padding:2rem;"><span class="loader"></span></td></tr>
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
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--text-muted);">No runs logged yet. Get out there!</td></tr>';
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
            const hasDetails = run.details && run.details.length > 0;
            const hasNotes = run.notes && run.notes.trim() !== '';
            const hasExpandableContent = hasDetails || hasNotes;
            
            if (hasExpandableContent) {
                tr.style.cursor = 'pointer';
            }
            
            tr.innerHTML = `
                <td style="padding:1rem;">${new Date(run.date).toLocaleDateString('fi-FI')} ${hasExpandableContent ? '<span style="font-size:0.8rem; color:var(--text-muted)">▶</span>' : ''}</td>
                <td style="padding:1rem; font-weight:600;">${run.distance}km</td>
                <td style="padding:1rem;">${formatDuration(run.duration)}</td>
            `;
            
            const actionsTd = document.createElement('td');
            actionsTd.style.padding = '1rem';
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-danger';
            delBtn.textContent = 'Delete';
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                tr.style.opacity = '0.5';
                await deleteRun(run.id);
                loadRuns();
            };
            actionsTd.appendChild(delBtn);
            tr.appendChild(actionsTd);
            
            tbody.appendChild(tr);
            
            // Add details
            if (hasExpandableContent) {
                const detailTr = document.createElement('tr');
                detailTr.style.display = 'none';
                detailTr.style.backgroundColor = 'rgba(0,0,0,0.2)';
                
                const detailTd = document.createElement('td');
                detailTd.colSpan = 4;
                detailTd.style.padding = '1rem 2rem';
                
                const detailList = document.createElement('div');
                detailList.style.display = 'flex';
                detailList.style.flexDirection = 'column';
                
                if (hasNotes) {
                    const noteDiv = document.createElement('div');
                    noteDiv.style.marginBottom = '0.7rem';
                    noteDiv.style.color = 'var(--text-muted)';
                    noteDiv.style.fontSize = '0.9rem';
                    noteDiv.textContent = run.notes;
                    detailList.appendChild(noteDiv);
                }
                
                if (hasDetails) {
                    run.details.forEach((d, i) => {
                        const item = document.createElement('div');
                        item.style.display = 'flex';
                        item.style.gap = '1rem';
                        
                        const indexDiv = document.createElement('div');
                        const distanceDiv = document.createElement('div');
                        const durationDiv = document.createElement('div');
                        // const restDiv = document.createElement('div');
                        
                        indexDiv.textContent = `${i + 1}:`;
                        distanceDiv.textContent = `${d.distance}km`;
                        durationDiv.textContent = `${formatDuration(d.duration)}`;
                        // restDiv.textContent = `${d.rest}`;

                        indexDiv.style.width = '20px';
                        distanceDiv.style.width = '40px';
                        durationDiv.style.width = '50px';
                        // restDiv.style.width = '50px';
                        indexDiv.style.color = 'var(--text-muted)';

                        item.appendChild(indexDiv);
                        item.appendChild(distanceDiv);
                        item.appendChild(durationDiv);
                        // item.appendChild(restDiv);
                        detailList.appendChild(item);
                    });
                }
                
                detailTd.appendChild(detailList);
                detailTr.appendChild(detailTd);
                tbody.appendChild(detailTr);
                
                const arrow = tr.querySelector('span');
                tr.onclick = () => {
                    if (detailTr.style.display === 'none') {
                        detailTr.style.display = 'table-row';
                        tr.style.backgroundColor = 'rgba(255,255,255,0.02)';
                        if (arrow) arrow.textContent = '▼';
                    } else {
                        detailTr.style.display = 'none';
                        tr.style.backgroundColor = 'transparent';
                        if (arrow) arrow.textContent = '▶';
                    }
                };
            }
        });
    };
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        
        const details = [];
        let totalDist = 0;
        let totalTime = 0;
        
        const rows = runsContainer.querySelectorAll('.run-input-row');
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const dist = parseFloat(inputs[0].value);
            const hours = parseInt(inputs[1].value) || 0;
            const minutes = parseInt(inputs[2].value) || 0;
            const seconds = parseInt(inputs[3].value) || 0;
            const time = hours * 3600 + minutes * 60 + seconds;
            details.push({ distance: dist, duration: time });
            
            totalDist += dist;
            totalTime += time;
        });
        
        await addRun(dateInput.value, totalDist.toFixed(2), totalTime, notesInput.value, details);
        
        notesInput.value = '';
        runsContainer.innerHTML = '';
        addRunRow();
        submitBtn.disabled = false;
        
        await loadRuns();
    };
    
    loadRuns();
    
    return container;
}
