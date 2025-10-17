// ================================================
// State management for tasks and settings
// ================================================
export const state = {
    tasks: [],
    tags: ['Academic', 'Fitness', 'Social', 'Personal', 'Work', 'Other'],
    weeklyGoal: 0,
    timeUnit: 'minutes',
    currentSort: { field: 'dueDate', order: 'asc' },
    editingId: null,
    searchRegex: null
};
// Generate a unique ID for a new task
export function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
// Add a new task to the state
export function addTask(task) {
    const now = new Date().toISOString();
    const newTask = {
        ...task,
        id: generateId(),
        createdAt: now,
        updatedAt: now
    };
    state.tasks.push(newTask);
    return newTask;
}
// Update an existing task by ID
export function updateTask(id, updates) {
    const index = state.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        state.tasks[index] = {
            ...state.tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        return state.tasks[index];
    }
    return null;
}
// Delete a task by ID
export function deleteTask(id) {
    const index = state.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        state.tasks.splice(index, 1);
        return true;
    }
    return false;
}
// Sort tasks by specified field and order
export function sortTasks(field, order = 'asc') {
    state.tasks.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (field === 'duration') {
            aVal = parseInt(aVal);
            bVal = parseInt(bVal);
        }
        
        if (field === 'title' || field === 'tag') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (field === 'priority') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    state.currentSort = { field, order };
}
// Get summary statistics for tasks
export function getStats() {
    const total = state.tasks.length;
    const totalMinutes = state.tasks.reduce((acc, t) => acc + parseInt(t.duration), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    // Top tag
    const tagCount = {};
    state.tasks.forEach(t => {
        tagCount[t.tag] = (tagCount[t.tag] || 0) + 1;
    });
    const topTag = Object.keys(tagCount).length > 0
        ? Object.keys(tagCount).reduce((a, b) => tagCount[a] > tagCount[b] ? a : b)
        : '-';
    
    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekMinutes = state.tasks
        .filter(t => new Date(t.dueDate) >= sevenDaysAgo)
        .reduce((acc, t) => acc + parseInt(t.duration), 0);
    const weekHours = (weekMinutes / 60).toFixed(1);
    
    return { total, totalHours, topTag, weekHours, weekMinutes, totalMinutes };
}
// Get trend data for the last 7 days
export function getTrendData() {
    const days = [];
    const hours = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayMinutes = state.tasks
            .filter(t => t.dueDate === dateStr)
            .reduce((acc, t) => acc + parseInt(t.duration), 0);
        
        days.push(dateStr.substring(5)); // MM-DD
        hours.push((dayMinutes / 60).toFixed(1));
    }
    
    return { days, hours };
}
// Convert time interval in minutes to hours
export function minutesToHours(minutes) {
    return (minutes / 60).toFixed(2);
}
// Convert time interval in hours to minutes
export function hoursToMinutes(hours) {
    return Math.round(hours * 60);
}