// Add to VALIDATORS object
export const VALIDATORS = {
    title: /^\S(?:.*\S)?$/,
    duration: /^[1-9]\d*$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(\w+)\s+\1\b/i,
    
    // Search patterns
    tagSearch: /^@(\w+)/,
    timePattern: /\b\d{1,2}:\d{2}\b/,
    studyKeywords: /(study|homework|assignment|exam|quiz)/i
};

export function validateField(field, value) {
    if (!value) return false;
    
    if (field === 'title') {
        if (!VALIDATORS.title.test(value)) return false;
        if (VALIDATORS.duplicateWord.test(value)) return false;
        return true;
    }
    
    if (VALIDATORS[field]) {
        return VALIDATORS[field].test(value);
    }
    
    return true;
}

export function validateTask(task) {
    const errors = {};
    
    if (!validateField('title', task.title)) {
        errors.title = 'Invalid title format or contains duplicate words';
    }
    
    if (!validateField('duration', task.duration.toString())) {
        errors.duration = 'Duration must be a positive integer';
    }
    
    if (!validateField('date', task.dueDate)) {
        errors.dueDate = 'Invalid date format (use YYYY-MM-DD)';
    }
    
    if (!validateField('tag', task.tag)) {
        errors.tag = 'Invalid tag format';
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}