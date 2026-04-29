import { getRuns, getTodos, getMemos, addMemo } from '../api.js';

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
    
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
        
        // Adjust for Monday start
        const firstDayIndex = (firstDay + 6) % 7;
        
        // Fetch runs, todos, memos to highlight or use in modal
        const runs = await getRuns(); 
        const todos = await getTodos();
        const memos = await getMemos();
        
        const runDates = new Set(runs.map(r => r.date));
        
        // Blank spaces
        for(let i = 0; i < firstDayIndex; i++) {
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
            
            // Interaction
            dayCell.style.cursor = 'pointer';
            dayCell.style.transition = 'all 0.2s';
            dayCell.onmouseover = () => dayCell.style.transform = 'scale(1.05)';
            dayCell.onmouseout = () => dayCell.style.transform = 'scale(1)';
            dayCell.onclick = () => showDayModal(dStr, i, month, year, runs, todos, memos);
            
            grid.appendChild(dayCell);
        }
    };
    
    function showDayModal(dStr, day, month, year, runs, todos, memos) {
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
        modal.style.maxWidth = '500px';
        modal.style.maxHeight = '80vh';
        modal.style.overflowY = 'auto';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.float = 'right';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'var(--text-primary)';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '1.2rem';
        closeBtn.onclick = () => document.body.removeChild(modalOverlay);
        
        const title = document.createElement('h2');
        title.style.margin = '0 0 1rem 0';
        title.textContent = new Date(year, month, day).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        modal.appendChild(closeBtn);
        modal.appendChild(title);
        
        // Filter data
        const dayRuns = runs.filter(r => r.date === dStr);
        const dayTodos = todos.filter(t => t.due_date && t.due_date.startsWith(dStr));
        const dayMemos = memos.filter(m => m.date === dStr);
        
        // Runs Section
        if (dayRuns.length > 0) {
            const runTitle = document.createElement('h3');
            runTitle.textContent = 'Runs';
            runTitle.style.color = 'var(--success)';
            modal.appendChild(runTitle);
            
            dayRuns.forEach(r => {
                const runDiv = document.createElement('div');
                runDiv.style.padding = '0.5rem';
                runDiv.style.background = 'rgba(255,255,255,0.05)';
                runDiv.style.borderRadius = 'var(--radius-sm)';
                runDiv.style.marginBottom = '0.5rem';
                runDiv.innerHTML = `<strong>${r.distance}km</strong> in ${r.duration || 'N/A'}${r.notes ? ` - ${r.notes}` : ''}`;
                modal.appendChild(runDiv);
            });
        }
        
        // Todos Section
        if (dayTodos.length > 0) {
            const todoTitle = document.createElement('h3');
            todoTitle.textContent = 'Tasks Due';
            todoTitle.style.color = 'var(--warning)';
            modal.appendChild(todoTitle);
            
            dayTodos.forEach(t => {
                const todoDiv = document.createElement('div');
                todoDiv.style.padding = '0.5rem';
                todoDiv.style.background = 'rgba(255,255,255,0.05)';
                todoDiv.style.borderRadius = 'var(--radius-sm)';
                todoDiv.style.marginBottom = '0.5rem';
                todoDiv.style.textDecoration = t.is_completed ? 'line-through' : 'none';
                todoDiv.style.opacity = t.is_completed ? '0.5' : '1';
                todoDiv.textContent = t.title;
                modal.appendChild(todoDiv);
            });
        }
        
        // Memos Section
        const memoTitle = document.createElement('h3');
        memoTitle.textContent = 'Memos';
        memoTitle.style.color = 'var(--accent-primary)';
        modal.appendChild(memoTitle);
        
        const memosContainer = document.createElement('div');
        dayMemos.forEach(m => {
            const memoDiv = document.createElement('div');
            memoDiv.style.padding = '0.5rem';
            memoDiv.style.background = 'rgba(255,255,255,0.05)';
            memoDiv.style.borderRadius = 'var(--radius-sm)';
            memoDiv.style.marginBottom = '0.5rem';
            memoDiv.textContent = m.content;
            memosContainer.appendChild(memoDiv);
        });
        modal.appendChild(memosContainer);
        
        // Add Memo Form
        const addMemoForm = document.createElement('form');
        addMemoForm.style.display = 'flex';
        addMemoForm.style.marginTop = '1rem';
        addMemoForm.style.gap = '0.5rem';
        
        const memoInput = document.createElement('input');
        memoInput.type = 'text';
        memoInput.placeholder = 'Add a new memo...';
        memoInput.className = 'input-field';
        memoInput.style.flex = '1';
        memoInput.required = true;
        
        const addBtn = document.createElement('button');
        addBtn.type = 'submit';
        addBtn.textContent = 'Add';
        addBtn.className = 'btn-primary';
        
        addMemoForm.onsubmit = async (e) => {
            e.preventDefault();
            addBtn.disabled = true;
            addBtn.textContent = '...';
            const newMemo = await addMemo(dStr, memoInput.value);
            if (newMemo && newMemo.length > 0) {
                memos.push(newMemo[0]);
                const memoDiv = document.createElement('div');
                memoDiv.style.padding = '0.5rem';
                memoDiv.style.background = 'rgba(255,255,255,0.05)';
                memoDiv.style.borderRadius = 'var(--radius-sm)';
                memoDiv.style.marginBottom = '0.5rem';
                memoDiv.textContent = newMemo[0].content;
                memosContainer.appendChild(memoDiv);
                memoInput.value = '';
            }
            addBtn.disabled = false;
            addBtn.textContent = 'Add';
        };
        
        addMemoForm.appendChild(memoInput);
        addMemoForm.appendChild(addBtn);
        modal.appendChild(addMemoForm);
        
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }
    
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
