import { getTodos, addTodo, toggleTodo, deleteTodo } from '../api.js';

export async function renderTodo() {
    const container = document.createElement('div');
    container.className = 'container animate-fade-in';
    
    const header = document.createElement('div');
    header.className = 'page-header';
    const title = document.createElement('h1');
    title.className = 'page-title';
    title.textContent = 'Todo';
    const desc = document.createElement('p');
    desc.className = 'page-description';
    desc.textContent = 'Manage your daily goals.';
    header.appendChild(title);
    header.appendChild(desc);
    
    // Add form
    const addCard = document.createElement('div');
    addCard.className = 'glass-card';
    addCard.style.marginBottom = '2rem';
    
    const form = document.createElement('form');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '2fr 1fr auto';
    form.style.gap = '1rem';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'What needs to be done?';
    input.required = true;
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.placeholder = 'Due Date';
    
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'btn-primary';
    btn.textContent = 'Add Task';
    
    form.appendChild(input);
    form.appendChild(dateInput);
    form.appendChild(btn);
    addCard.appendChild(form);
    
    // List
    const listCard = document.createElement('div');
    listCard.className = 'glass-card';
    
    const listContainer = document.createElement('div');
    
    // Loader
    const loader = document.createElement('span');
    loader.className = 'loader';
    listContainer.appendChild(loader);
    listCard.appendChild(listContainer);
    
    container.appendChild(header);
    container.appendChild(addCard);
    container.appendChild(listCard);
    
    // Logic
    const loadTodos = async () => {
        const todos = await getTodos();
        listContainer.innerHTML = '';
        if (todos.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No tasks yet. You are all caught up!</p>';
            return;
        }
        
        todos.forEach(todo => {
            const item = document.createElement('div');
            item.className = 'todo-item' + (todo.is_completed ? ' completed' : '');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.is_completed;
            
            const textContainer = document.createElement('div');
            textContainer.style.flex = '1';
            textContainer.style.display = 'flex';
            textContainer.style.flexDirection = 'column';

            const text = document.createElement('span');
            text.className = 'todo-text';
            text.textContent = todo.title;
            textContainer.appendChild(text);

            const dateContainer = document.createElement('div');

            if (todo.due_date) {
                const dateSpan = document.createElement('span');
                dateSpan.style.fontSize = '0.7rem';
                dateSpan.style.color = 'var(--text-muted)';
                dateSpan.textContent = 'Due: ' + new Date(todo.due_date).toLocaleDateString();
                // Check if past due
                if (!todo.is_completed && new Date(todo.due_date) < new Date(new Date().setHours(0,0,0,0))) {
                    dateSpan.style.color = 'var(--danger)';
                }
                dateContainer.appendChild(dateSpan);
                dateContainer.style.width = '100px';
                dateContainer.style.marginRight = '1rem';
                dateContainer.style.textAlign = 'left';
            }
            
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-danger';
            delBtn.textContent = 'Delete';
            
            checkbox.onchange = async () => {
                await toggleTodo(todo.id, todo.is_completed);
                item.classList.toggle('completed');
                todo.is_completed = !todo.is_completed;
            };
            
            delBtn.onclick = async () => {
                item.style.opacity = '0.5';
                await deleteTodo(todo.id);
                item.remove();
                if (listContainer.children.length === 0) loadTodos();
            };
            
            item.appendChild(checkbox);
            item.appendChild(textContainer);
            if (todo.due_date) { item.appendChild(dateContainer); }
            item.appendChild(delBtn);
            listContainer.appendChild(item);
        });
    };
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        const title = input.value;
        const due_date = dateInput.value;
        input.value = '';
        dateInput.value = '';
        input.disabled = true;
        dateInput.disabled = true;
        btn.disabled = true;
        
        await addTodo(title, due_date);
        await loadTodos();
        
        input.disabled = false;
        dateInput.disabled = false;
        btn.disabled = false;
        input.focus();
    };
    
    loadTodos();
    
    return container;
}
