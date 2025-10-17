// ================================================
// Search functionality for tasks
// ================================================
export function compileRegex(input, flags = 'gi') {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch (e) {
        return null;
    }
}
// Highlight text matches with the search regex
export function highlight(text, regex) {
    if (!regex || typeof text !== 'string') return text;
    
    try {
        return text.replace(regex, match => `<mark>${match}</mark>`);
    } catch (e) {
        return text;
    }
}
// Search tasks based on the provided regex
export function searchTasks(tasks, regex) {
    if (!regex) return tasks;
    
    return tasks.filter(t => {
        return regex.test(t.title) || 
               regex.test(t.tag) || 
               regex.test(t.duration.toString()) ||
               regex.test(t.dueDate) ||
               (t.priority && regex.test(t.priority));
    });
}