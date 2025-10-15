const STORAGE_KEY = 'campus_planner_data';
const SETTINGS_KEY = 'campus_planner_settings';

export function loadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading data:', e);
        return [];
    }
}

export function saveData(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        return false;
    }
}

export function loadSettings() {
    try {
        const settings = localStorage.getItem(SETTINGS_KEY);
        return settings ? JSON.parse(settings) : null;
    } catch (e) {
        console.error('Error loading settings:', e);
        return null;
    }
}

export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (e) {
        console.error('Error saving settings:', e);
        return false;
    }
}

export function exportData(tasks) {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus_planner_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function validateImportData(data) {
    if (!Array.isArray(data)) {
        return { valid: false, error: 'Data must be an array' };
    }

    for (const item of data) {
        if (!item.id || !item.title || !item.duration || !item.tag || !item.dueDate) {
            return { valid: false, error: 'Invalid task structure - missing required fields' };
        }
        
        if (typeof item.duration !== 'number' || item.duration <= 0) {
            return { valid: false, error: 'Duration must be a positive number' };
        }
    }

    return { valid: true };
}