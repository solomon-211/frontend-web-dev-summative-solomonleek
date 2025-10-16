import { state, sortTasks, minutesToHours } from './state.js';
import { highlight } from './search.js';
import { validateField } from './validators.js';

export function showStatus(message, type = 'success') {
    const status = document.getElementById('status-message');
    status.textContent = message;
    status.className = `status-message ${type}`;
    
    setTimeout(() => {
        status.className = 'status-message';
    }, 5000);
}

export function formatDuration(minutes) {
    if (state.timeUnit === 'hours') {
        return `${minutesToHours(minutes)}h`;
    }
    return `${minutes} min`;
}

export function updateDashboard() {
    const stats = getStatsData();
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-hours').textContent = stats.totalHours + 'h';
    document.getElementById('stat-top').textContent = stats.topTag;
    document.getElementById('stat-week').textContent = stats.weekHours + 'h';
    
    updateTrendChart();
    updateGoalStatus(parseFloat(stats.weekHours));
}

function getStatsData() {
    const total = state.tasks.length;
    const totalMinutes = state.tasks.reduce((acc, t) => acc + parseInt(t.duration), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    const tagCount = {};
    state.tasks.forEach(t => {
        tagCount[t.tag] = (tagCount[t.tag] || 0) + 1;
    });
    const topTag = Object.keys(tagCount).length > 0
        ? Object.keys(tagCount).reduce((a, b) => tagCount[a] > tagCount[b] ? a : b)
        : '-';
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekMinutes = state.tasks
        .filter(t => new Date(t.dueDate) >= sevenDaysAgo)
        .reduce((acc, t) => acc + parseInt(t.duration), 0);
    const weekHours = (weekMinutes / 60).toFixed(1);
    
    return { total, totalHours, topTag, weekHours };
}

function updateTrendChart() {
    const chart = document.getElementById('trend-chart');
    chart.innerHTML = '';
    
    const days = [];
    const hours = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayMinutes = state.tasks
            .filter(t => t.dueDate === dateStr)
            .reduce((acc, t) => acc + parseInt(t.duration), 0);
        
        days.push(dateStr.substring(5));
        hours.push((dayMinutes / 60));
    }
    
    const maxHours = Math.max(...hours, 1);
    
    hours.forEach((hour, i) => {
        const bar = document.createElement('div');
        bar.className = 'trend-bar';
        bar.style.height = `${(hour / maxHours) * 100}%`;
        bar.title = `${days[i]}: ${hour.toFixed(1)}h`;
        
        const label = document.createElement('div');
        label.className = 'trend-bar-label';
        label.textContent = days[i];
        bar.appendChild(label);
        
        if (hour > 0) {
            const value = document.createElement('div');
            value.className = 'trend-bar-value';
            value.textContent = hour.toFixed(1) + 'h';
            bar.appendChild(value);
        }
        
        chart.appendChild(bar);
    });
}

function updateGoalStatus(weekHours) {
    const goalStatus = document.getElementById('goal-status');
    const goal = state.weeklyGoal;
    
    if (!goal || goal <= 0) {
        goalStatus.textContent = '';
        goalStatus.className = '';
        return;
    }
    
    const remaining = goal - weekHours;
    const percentage = ((weekHours / goal) * 100).toFixed(0);
    
    if (weekHours >= goal) {
        goalStatus.textContent = `🎉 Goal achieved! ${percentage}% complete (${weekHours}h / ${goal}h)`;
        goalStatus.className = 'met-goal';
        goalStatus.setAttribute('aria-live', 'assertive');
    } else if (remaining <= goal * 0.2) {
        goalStatus.textContent = `⚠️ Close to goal: ${remaining.toFixed(1)}h remaining (${percentage}% complete)`;
        goalStatus.className = 'over-goal';
        goalStatus.setAttribute('aria-live', 'polite');
    } else {
        goalStatus.textContent = `✓ On track: ${remaining.toFixed(1)}h remaining to reach your ${goal}h goal (${percentage}% complete)`;
        goalStatus.className = 'under-goal';
        goalStatus.setAttribute('aria-live', 'polite');
    }
}

export function renderTasks(filteredTasks = null) {
    const tasks = filteredTasks || state.tasks;
    const tbody = document.getElementById('tasks-tbody');
    const cards = document.getElementById('tasks-cards');
    const empty = document.getElementById('empty-state');
    
    tbody.innerHTML = '';
    cards.innerHTML = '';
    
    if (tasks.length === 0) {
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    
    tasks.forEach(t => {
        const titleText = state.searchRegex ? highlight(t.title, state.searchRegex) : t.title;
        const tagText = state.searchRegex ? highlight(t.tag, state.searchRegex) : t.tag;
        const priorityClass = `priority-${t.priority || 'medium'}`;
        
        // Table row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${titleText}</td>
            <td>${formatDuration(t.duration)}</td>
            <td>${tagText}</td>
            <td>${t.dueDate}</td>
            <td>
                <button class="btn btn-secondary btn-sm edit-btn" data-id="${t.id}" aria-label="Edit ${t.title}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${t.id}" aria-label="Delete ${t.title}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
        
        // Mobile card
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-card-header">
                <div class="task-card-title">${titleText}</div>
                <div class="task-card-duration">${formatDuration(t.duration)}</div>
            </div>
            <div class="task-card-details">
                ${tagText} • ${t.dueDate} • <span class="${priorityClass}">${(t.priority || 'medium').toUpperCase()}</span>
            </div>
            <div class="btn-group">
                <button class="btn btn-secondary btn-sm edit-btn" data-id="${t.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${t.id}">Delete</button>
            </div>
        `;
        cards.appendChild(card);
    });
    
    attachTaskEventListeners();
}

function attachTaskEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

function handleEdit(e) {
    const id = e.target.dataset.id;
    const task = state.tasks.find(t => t.id === id);
    
    if (task) {
        document.getElementById('edit-id').value = id;
        document.getElementById('title').value = task.title;
        document.getElementById('duration').value = task.duration;
        document.getElementById('tag').value = task.tag;
        document.getElementById('dueDate').value = task.dueDate;
        document.getElementById('priority').value = task.priority || 'medium';
        
        document.getElementById('form-title').textContent = 'Edit Task';
        document.getElementById('submit-btn').textContent = 'Update Task';
        document.getElementById('cancel-btn').style.display = 'inline-block';
        
        // Switch to form section
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        document.querySelector('nav button[data-section="add"]').classList.add('active');
        document.querySelectorAll('main > section').forEach(s => s.classList.remove('active'));
        document.getElementById('add').classList.add('active');
        
        document.getElementById('title').focus();
    }
}

function handleDelete(e) {
    const id = e.target.dataset.id;
    const task = state.tasks.find(t => t.id === id);
    
    if (task && confirm(`Are you sure you want to delete "${task.title}"?`)) {
        const index = state.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            state.tasks.splice(index, 1);
            showStatus('Task deleted successfully', 'success');
            
            import('./storage.js').then(module => {
                module.saveData(state.tasks);
            });
            
            renderTasks();
        }
    }
}

export function updateTagSelect() {
    const select = document.getElementById('tag');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Select tag</option>';
    state.tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
    
    if (currentValue && state.tags.includes(currentValue)) {
        select.value = currentValue;
    }
}

export function renderSettings() {
    document.getElementById('weekly-goal').value = state.weeklyGoal || '';
    
    // Set time unit radio
    document.querySelectorAll('input[name="time-unit"]').forEach(radio => {
        radio.checked = radio.value === state.timeUnit;
    });
    
    renderTags();
}

function renderTags() {
    const list = document.getElementById('tags-list');
    list.innerHTML = '';
    
    state.tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        badge.innerHTML = `
            ${tag}
            ${state.tags.length > 1 ? `<button data-tag="${tag}" class="remove-tag" aria-label="Remove ${tag} tag">×</button>` : ''}
        `;
        list.appendChild(badge);
    });
    
    document.querySelectorAll('.remove-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tag = e.target.dataset.tag;
            if (state.tags.length > 1) {
                state.tags = state.tags.filter(t => t !== tag);
                import('./storage.js').then(module => {
                    module.saveSettings({
                        tags: state.tags,
                        weeklyGoal: state.weeklyGoal,
                        timeUnit: state.timeUnit
                    });
                });
                renderTags();
                updateTagSelect();
                showStatus(`Tag "${tag}" removed`, 'success');
            }
        });
    });
}

export function setupTableSort() {
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            let order = 'asc';
            
            if (state.currentSort.field === field) {
                order = state.currentSort.order === 'asc' ? 'desc' : 'asc';
            }
            
            sortTasks(field, order);
            
            document.querySelectorAll('th.sortable').forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            
            th.classList.add(order === 'asc' ? 'sort-asc' : 'sort-desc');
            
            renderTasks();
        });
    });
}

export function validateFormField(field, input) {
    const formGroup = input.closest('.form-group');
    const value = input.value.trim();
    
    if (value && !validateField(field, value)) {
        formGroup.classList.add('error');
        return false;
    } else {
        formGroup.classList.remove('error');
        return true;
    }
}