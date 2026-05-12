export function parseDuration(durStr) {
    let minutes = 0;
    const hMatch = durStr.match(/(\d+)\s*h/i);
    const mMatch = durStr.match(/(\d+)\s*m/i);
    if (hMatch) minutes += parseInt(hMatch[1]) * 60;
    if (mMatch) minutes += parseInt(mMatch[1]);
    
    if (!hMatch && !mMatch && durStr.includes(':')) {
        const parts = durStr.split(':');
        if (parts.length === 2) {
            minutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
    }
    
    if (!hMatch && !mMatch && !durStr.includes(':')) {
        const parsed = parseInt(durStr);
        if (!isNaN(parsed)) minutes += parsed;
    }
    
    return minutes;
}

export function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    let result = '';
    if (h > 0) result += `${h.toString().padStart(2, '0')}:`;
    if (h > 0 || m > 0) result += `${m.toString().padStart(2, '0')}:`;
    if (h > 0 || m > 0 || s > 0) result += `${s.toString().padStart(2, '0')}`;

    return result || '-';
}