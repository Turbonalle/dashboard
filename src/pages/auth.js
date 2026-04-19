import { supabase } from '../supabase.js';

export function renderAuth() {
    const container = document.createElement('div');
    container.className = 'container auth-container animate-fade-in';

    const box = document.createElement('div');
    box.className = 'glass-card auth-box';

    const title = document.createElement('h2');
    title.className = 'page-title';
    title.textContent = 'Welcome';
    title.style.textAlign = 'center';
    title.style.marginBottom = '2rem';

    const form = document.createElement('form');
    form.onsubmit = (e) => e.preventDefault();

    const emailGroup = document.createElement('div');
    emailGroup.className = 'input-group';
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.required = true;
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);

    const passGroup = document.createElement('div');
    passGroup.className = 'input-group';
    const passLabel = document.createElement('label');
    passLabel.textContent = 'Password';
    const passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.required = true;
    passGroup.appendChild(passLabel);
    passGroup.appendChild(passInput);

    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'var(--danger)';
    errorMsg.style.marginBottom = '1rem';
    errorMsg.style.textAlign = 'center';
    errorMsg.style.fontSize = '0.9rem';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.flexDirection = 'column';
    actions.style.gap = '1rem';
    actions.style.marginTop = '2rem';

    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn-primary';
    loginBtn.textContent = 'Log In';
    loginBtn.type = 'submit';

    const registerBtn = document.createElement('button');
    registerBtn.textContent = 'Create Account';
    registerBtn.style.background = 'transparent';
    registerBtn.style.border = '1px solid var(--glass-border)';
    registerBtn.style.color = 'var(--text-main)';
    registerBtn.style.padding = '0.8rem';
    registerBtn.style.borderRadius = 'var(--radius-md)';
    registerBtn.style.cursor = 'pointer';
    registerBtn.style.transition = 'var(--transition)';
    registerBtn.onmouseover = () => registerBtn.style.background = 'rgba(255,255,255,0.05)';
    registerBtn.onmouseout = () => registerBtn.style.background = 'transparent';

    loginBtn.onclick = async () => {
        if (!emailInput.value || !passInput.value) return;
        errorMsg.textContent = '';
        const { error } = await supabase.auth.signInWithPassword({
            email: emailInput.value,
            password: passInput.value
        });
        if (error) errorMsg.textContent = error.message;
    };

    registerBtn.onclick = async () => {
        if (!emailInput.value || !passInput.value) return;
        errorMsg.textContent = '';
        const { error } = await supabase.auth.signUp({
            email: emailInput.value,
            password: passInput.value
        });
        if (error) {
            errorMsg.textContent = error.message;
        } else {
            errorMsg.style.color = 'var(--success)';
            errorMsg.textContent = 'Check your email for the confirmation link!';
        }
    };

    form.appendChild(emailGroup);
    form.appendChild(passGroup);
    form.appendChild(errorMsg);

    actions.appendChild(loginBtn);
    actions.appendChild(registerBtn);
    form.appendChild(actions);

    box.appendChild(title);
    box.appendChild(form);
    container.appendChild(box);

    return container;
}
