import { getRuns } from '../api.js';

export async function renderCalendar() {
    const container = document.createElement('div');
    container.className = 'container animate-fade-in';
    
    const header = document.createElement('div');
    header.className = 'page-header';
    const title = document.createElement('h1');
    title.className = 'page-title';
    title.textContent = 'Calendar';
    const desc = document.createElement('p');
    desc.className = 'page-description';
    desc.textContent = 'Your runs highlighted for the month.';
    header.appendChild(title);
    header.appendChild(desc);
    
    const calCard = document.createElement('div');
    calCard.className = 'glass-card';
    
    // Calendar controls
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-between';
    controls.style.alignItems = 'center';
    controls.style.marginBottom = '2rem';
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.className = 'btn-primary';
    prevBtn.style.padding = '0.5rem 1rem';
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.className = 'btn-primary';
    nextBtn.style.padding = '0.5rem 1rem';
    
    const monthLabel = document.createElement('h2');
    monthLabel.style.margin = '0';
    
    controls.appendChild(prevBtn);
    controls.appendChild(monthLabel);
    controls.appendChild(nextBtn);
    calCard.appendChild(controls);
    
    // Grid
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    grid.style.gap = '0.5rem';
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(d => {
        const span = document.createElement('div');
        span.textContent = d;
        span.style.textAlign = 'center';
        span.style.fontWeight = 'bold';
        span.style.color = 'var(--text-muted)';
        span.style.marginBottom = '0.5rem';
        grid.appendChild(span);
    });
    
    calCard.appendChild(grid);
    container.appendChild(header);
    container.appendChild(calCard);
    
    let currentDate = new Date();
    
    const renderGrid = async () => {
        // Clear old days
        while (grid.children.length > 7) {
            grid.removeChild(grid.lastChild);
        }
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        monthLabel.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Fetch runs to highlight
        const runs = await getRuns(); // In a real app we'd filter by month to save data
        const runDates = new Set(runs.map(r => r.date));
        
        // Blank spaces
        for(let i = 0; i < firstDay; i++) {
            const blank = document.createElement('div');
            grid.appendChild(blank);
        }
        
        // Days
        for(let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.textContent = i;
            dayCell.style.padding = '1rem';
            dayCell.style.textAlign = 'center';
            dayCell.style.background = 'rgba(255,255,255,0.02)';
            dayCell.style.borderRadius = 'var(--radius-sm)';
            dayCell.style.border = '1px solid var(--glass-border)';
            
            // Check if we ran this day
            // Construct string YYYY-MM-DD
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            if (runDates.has(dStr)) {
                dayCell.style.background = 'rgba(16, 185, 129, 0.2)'; // Success color tint
                dayCell.style.borderColor = 'var(--success)';
                dayCell.style.color = 'white';
                dayCell.style.fontWeight = 'bold';
                dayCell.title = 'Ran on this day!';
            }
            
            // Highlight today
            const today = new Date();
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.style.boxShadow = 'inset 0 0 0 2px var(--accent-primary)';
            }
            
            grid.appendChild(dayCell);
        }
    };
    
    prevBtn.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderGrid();
    };
    
    nextBtn.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderGrid();
    };
    
    renderGrid();
    
    return container;
}
