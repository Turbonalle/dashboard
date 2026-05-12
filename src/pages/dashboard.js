import { getDashboardConfig, setDashboardConfig, getTodos, getLinks, getRuns } from '../api.js';
import { formatDuration } from '../utils.js';

export async function renderDashboard() {
    const container = document.createElement('div');
    container.className = 'container animate-fade-in';

    const header = document.createElement('div');
    header.className = 'page-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const titleGroup = document.createElement('div');
    const title = document.createElement('h1');
    title.className = 'page-title';
    title.textContent = 'Dashboard';
    const desc = document.createElement('p');
    desc.className = 'page-description';
    desc.textContent = 'Manage your life in one place.';
    titleGroup.appendChild(title);
    titleGroup.appendChild(desc);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit Layout';
    editBtn.className = 'btn-secondary';

    header.appendChild(titleGroup);
    header.appendChild(editBtn);
    container.appendChild(header);

    // Fetch config and data
    const config = await getDashboardConfig();
    const layout = config.layout || ['tasks', 'links', 'runs', 'calendar'];

    const todos = await getTodos();
    const links = await getLinks();
    const runs = await getRuns();

    // Grid Container
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    grid.style.gap = '1.5rem';
    container.appendChild(grid);

    // Widget Renderers
    const widgetMap = {
        'tasks': () => renderTasksWidget(todos),
        'links': () => renderLinksWidget(links),
        'runs': () => renderRunsWidget(runs),
        'calendar': () => renderCalendarWidget(runs)
    };

    const renderGrid = () => {
        grid.innerHTML = '';
        layout.forEach(widgetName => {
            if (widgetMap[widgetName]) {
                grid.appendChild(widgetMap[widgetName]());
            }
        });
    };

    renderGrid();

    // Edit Modal
    editBtn.onclick = () => showEditModal(layout, async (newLayout) => {
        await setDashboardConfig(newLayout);
        layout.splice(0, layout.length, ...newLayout);
        renderGrid();
    });

    return container;
}

// Widgets
function renderTasksWidget(todos) {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '1rem';

    const title = document.createElement('h2');
    title.textContent = 'Urgent Tasks';
    title.style.margin = '0';
    card.appendChild(title);

    const list = document.createElement('div');
    const urgentTodos = todos.filter(t => !t.is_completed && t.due_date).slice(0, 5);

    if (urgentTodos.length === 0) {
        list.textContent = 'No urgent tasks.';
        list.style.color = 'var(--text-muted)';
    } else {
        urgentTodos.forEach(t => {
            const item = document.createElement('div');
            item.style.padding = '0rem 0.5rem';
            item.style.background = 'rgba(255,255,255,0.05)';
            item.style.borderRadius = 'var(--radius-sm)';
            item.style.marginBottom = '0.5rem';

            // Align left/right content
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';

            // Calculate days left
            const today = new Date();
            const dueDate = new Date(t.due_date);
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            const diffMs = dueDate - today;
            const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            // Left text
            const title = document.createElement('span');
            title.textContent = t.title;

            // Right text
            const days = document.createElement('div');
            days.style.display = 'flex';
            days.style.alignItems = 'center';
            days.style.gap = '0.5rem';
            const daysNumber = document.createElement('span');
            daysNumber.textContent = daysLeft.toString();
            daysNumber.style.fontSize = '1.5rem';
            daysNumber.style.fontWeight = 'bold';
            const daysText = document.createElement('span');
            daysText.textContent = 'days';
            daysText.style.fontSize = '0.6rem';
            days.appendChild(daysNumber);
            days.appendChild(daysText);

            // Set color of days
            if (daysLeft <= 0) daysNumber.style.color = 'var(--danger)';
            else if (daysLeft <= 3) daysNumber.style.color = 'var(--warning)';
            else daysNumber.style.color = 'var(--success)';

            item.appendChild(title);
            item.appendChild(days);
            list.appendChild(item);
        });
    }

    card.appendChild(list);
    return card;
}

function renderLinksWidget(links) {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '1rem';

    const title = document.createElement('h2');
    title.textContent = 'Recent Links';
    title.style.margin = '0';
    card.appendChild(title);

    const list = document.createElement('div');
    const recentLinks = links.slice(0, 5);

    if (recentLinks.length === 0) {
        list.textContent = 'No links added yet.';
        list.style.color = 'var(--text-muted)';
    } else {
        recentLinks.forEach(l => {
            const a = document.createElement('a');
            a.href = l.url;
            a.target = '_blank';
            a.textContent = l.title;
            a.style.display = 'block';
            a.style.padding = '0.5rem';
            a.style.background = 'rgba(255,255,255,0.05)';
            a.style.borderRadius = 'var(--radius-sm)';
            a.style.color = 'var(--accent-primary)';
            a.style.textDecoration = 'none';
            a.style.marginBottom = '0.5rem';
            list.appendChild(a);
        });
    }

    card.appendChild(list);
    return card;
}

function renderRunsWidget(runs) {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '1rem';

    const title = document.createElement('h2');
    title.textContent = 'Recent Runs';
    title.style.margin = '0';
    card.appendChild(title);

    const list = document.createElement('div');
    const recentRuns = runs.slice(0, 3);

    if (recentRuns.length === 0) {
        list.textContent = 'No runs recorded yet.';
        list.style.color = 'var(--text-muted)';
    } else {
        recentRuns.forEach(r => {
            const item = document.createElement('div');
            item.style.padding = '0.5rem';
            item.style.background = 'rgba(255,255,255,0.05)';
            item.style.borderRadius = 'var(--radius-sm)';
            item.style.marginBottom = '0.5rem';
            item.innerHTML = `<strong>${r.date}</strong>: ${r.distance}km - ${formatDuration(r.duration) || 'N/A'}`;
            list.appendChild(item);
        });
    }

    card.appendChild(list);
    return card;
}

function renderCalendarWidget(runs) {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '1rem';

    const title = document.createElement('h2');
    title.textContent = 'Mini Calendar';
    title.style.margin = '0';
    card.appendChild(title);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    grid.style.gap = '0.2rem';

    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    daysOfWeek.forEach(d => {
        const span = document.createElement('div');
        span.textContent = d;
        span.style.textAlign = 'center';
        span.style.fontWeight = 'bold';
        span.style.fontSize = '0.8rem';
        span.style.color = 'var(--text-muted)';
        grid.appendChild(span);
    });

    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + mondayOffset);

    const runDates = new Set(runs.map(r => r.date));

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);

        const cell = document.createElement('div');
        cell.textContent = d.getDate();
        cell.style.textAlign = 'center';
        cell.style.padding = '0.5rem 0';
        cell.style.background = 'rgba(255,255,255,0.02)';
        cell.style.borderRadius = 'var(--radius-sm)';
        cell.style.fontSize = '0.9rem';

        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (runDates.has(dStr)) {
            cell.style.background = 'rgba(16, 185, 129, 0.2)';
            cell.style.color = 'var(--success)';
            cell.style.fontWeight = 'bold';
        }

        if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
            cell.style.boxShadow = 'inset 0 0 0 1px var(--accent-primary)';
        }

        grid.appendChild(cell);
    }

    card.appendChild(grid);
    return card;
}

function showEditModal(currentLayout, onSave) {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100vw';
    modalOverlay.style.height = '100vh';
    modalOverlay.style.background = 'rgba(0,0,0,0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '1000';
    modalOverlay.style.backdropFilter = 'blur(4px)';

    const modal = document.createElement('div');
    modal.className = 'glass-card animate-fade-in';
    modal.style.width = '90%';
    modal.style.maxWidth = '400px';

    const title = document.createElement('h2');
    title.textContent = 'Edit Dashboard Layout';
    title.style.marginTop = '0';
    modal.appendChild(title);

    const options = ['tasks', 'links', 'runs', 'calendar'];
    const selects = [];

    for (let i = 0; i < 4; i++) {
        const div = document.createElement('div');
        div.style.marginBottom = '1rem';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '0.5rem';

        const label = document.createElement('label');
        label.textContent = `Widget ${i + 1}`;
        div.appendChild(label);

        const select = document.createElement('select');
        select.className = 'input-field';

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
            if (currentLayout[i] === opt) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        selects.push(select);
        div.appendChild(select);
        modal.appendChild(div);
    }

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.justifyContent = 'flex-end';
    btns.style.gap = '1rem';
    btns.style.marginTop = '1.5rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn-secondary';
    cancelBtn.onclick = () => document.body.removeChild(modalOverlay);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'btn-primary';
    saveBtn.onclick = () => {
        const newLayout = selects.map(s => s.value);
        onSave(newLayout);
        document.body.removeChild(modalOverlay);
    };

    btns.appendChild(cancelBtn);
    btns.appendChild(saveBtn);
    modal.appendChild(btns);

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
}