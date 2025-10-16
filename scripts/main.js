import { state, addTask, updateTask } from './state.js';
import { loadData, saveData, loadSettings, saveSettings, exportData, validateImportData } from './storage.js';
import { validateField } from './validators.js';
import { compileRegex, searchTasks } from './search.js';
import { 
    showStatus, 
    updateDashboard, 
    renderTasks, 
    updateTagSelect,
    renderSettings,
    setupTableSort,
    validateFormField
} from './ui.js';

// Initialize app
function init() {
    // Load data
    state.tasks = loadData();
    
    const settings = loadSettings();
    if (settings) {
        state.tags = settings.tags || state.tags;
        state.weeklyGoal = settings.weeklyGoal || 0;
        state.timeUnit = settings.timeUnit || 'minutes';
    }
    
    // Setup UI
    updateTagSelect();
    setupNavigation();
    setupForm();
    setupSearch();
    setupSettings();
    setupTableSort();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dueDate').value = today;
    
    renderTasks();
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('nav button').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            
            document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('main > section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
            
            if (section === 'dashboard') updateDashboard();
            if (section === 'tasks') renderTasks();
            if (section === 'settings') renderSettings();
        });
    });
}

// Form handling
function setupForm() {
    const form = document.getElementById('task-form');
    const inputs = {
        title: document.getElementById('title'),
        duration: document.getElementById('duration'),
        tag: document.getElementById('tag'),
        dueDate: document.getElementById('dueDate')
    };
    
    // Real-time validation
    Object.entries(inputs).forEach(([field, input]) => {
        input.addEventListener('blur', () => {
            validateFormField(field, input);
        });
        
        input.addEventListener('input', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup.classList.contains('error')) {
                validateFormField(field, input);
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        Object.entries(inputs).forEach(([field, input]) => {
            if (!validateFormField(field, input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showStatus('Please fix validation errors', 'error');
            return;
        }
        
        const editId = document.getElementById('edit-id').value;
        const taskData = {
            title: inputs.title.value.trim(),
            duration: parseInt(inputs.duration.value),
            tag: inputs.tag.value,
            dueDate: inputs.dueDate.value,
            priority: document.getElementById('priority').value
        };
        
        if (editId) {
            updateTask(editId, taskData);
            showStatus('Task updated successfully', 'success');
        } else {
            addTask(taskData);
            showStatus('Task added successfully', 'success');
        }
        
        saveData(state.tasks);
        resetForm();
        renderTasks();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', resetForm);
    
    // ESC key to cancel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('edit-id').value) {
            resetForm();
        }
    });
}

function resetForm() {
    const form = document.getElementById('task-form');
    form.reset();
    
    document.getElementById('edit-id').value = '';
    document.getElementById('form-title').textContent = 'Add New Task';
    document.getElementById('submit-btn').textContent = 'Add Task';
    document.getElementById('cancel-btn').style.display = 'none';
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dueDate').value = today;
    
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
}

// Search
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const caseInsensitive = document.getElementById('case-insensitive');
    const clearBtn = document.getElementById('clear-search');
    
    function performSearch() {
        const pattern = searchInput.value.trim();
        
        if (!pattern) {
            state.searchRegex = null;
            renderTasks();
            return;
        }
        
        const flags = caseInsensitive.checked ? 'gi' : 'g';
        const regex = compileRegex(pattern, flags);
        
        if (!regex) {
            showStatus('Invalid regex pattern', 'error');
            return;
        }
        
        state.searchRegex = regex;
        const filtered = searchTasks(state.tasks, regex);
        renderTasks(filtered);
        
        showStatus(`Found ${filtered.length} matching task(s)`, 'success');
    }
    
    searchInput.addEventListener('input', performSearch);
    caseInsensitive.addEventListener('change', performSearch);
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchRegex = null;
        renderTasks();
    });
}

// Settings
function setupSettings() {
    // Weekly goal
    document.getElementById('weekly-goal').addEventListener('change', (e) => {
        state.weeklyGoal = parseFloat(e.target.value) || 0;
        saveSettings({
            tags: state.tags,
            weeklyGoal: state.weeklyGoal,
            timeUnit: state.timeUnit
        });
        updateDashboard();
        showStatus('Weekly goal updated', 'success');
    });
    
    // Time unit preference
    document.querySelectorAll('input[name="time-unit"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.timeUnit = e.target.value;
            saveSettings({
                tags: state.tags,
                weeklyGoal: state.weeklyGoal,
                timeUnit: state.timeUnit
            });
            renderTasks();
            showStatus(`Display changed to ${state.timeUnit}`, 'success');
        });
    });
    
    // Add tag
    document.getElementById('add-tag').addEventListener('click', () => {
        const input = document.getElementById('new-tag');
        const tag = input.value.trim();
        
        if (!tag) return;
        
        if (!validateField('tag', tag)) {
            showStatus('Invalid tag name (use letters, spaces, or hyphens only)', 'error');
            return;
        }
        
        if (state.tags.includes(tag)) {
            showStatus('Tag already exists', 'error');
            return;
        }
        
        state.tags.push(tag);
        saveSettings({
            tags: state.tags,
            weeklyGoal: state.weeklyGoal,
            timeUnit: state.timeUnit
        });
        
        input.value = '';
        renderSettings();
        updateTagSelect();
        showStatus(`Tag "${tag}" added`, 'success');
    });
    
    // Export
    document.getElementById('export-btn').addEventListener('click', () => {
        exportData(state.tasks);
        showStatus('Data exported successfully', 'success');
    });
    
    // Import
    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const validation = validateImportData(data);
                
                if (!validation.valid) {
                    showStatus(`Import failed: ${validation.error}`, 'error');
                    return;
                }
                
                state.tasks = data;
                saveData(state.tasks);
                renderTasks();
                showStatus(`Imported ${data.length} task(s) successfully`, 'success');
            } catch (error) {
                showStatus('Invalid JSON file', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
    
    // Clear all
    document.getElementById('clear-all').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            state.tasks = [];
            saveData(state.tasks);
            renderTasks();
            showStatus('All data cleared', 'warning');
        }
    });
}

// Start the app
init();