export async function renderDashboard() {
	const container = document.createElement('div');
	const header = document.createElement('div');
	header.className = 'page-header';
	const title = document.createElement('h1');
	title.className = 'page-title';
	title.textContent = 'Dashboard';
	const desc = document.createElement('p');
    desc.className = 'page-description';
    desc.textContent = 'Manage your life in one place.';
    header.appendChild(title);
    header.appendChild(desc);

	container.appendChild(header);
	return container;
}