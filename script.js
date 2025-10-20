// NeuroPlanner - Energy-Based Task Management System
// All data persists in LocalStorage

// ==================== DATA STRUCTURE ====================
let appState = {
    tasks: [],
    history: [],
    currentEnergy: null,
    dailyRating: null
};

// ==================== LOCALSTORAGE MANAGEMENT ====================

/**
 * Load all data from LocalStorage on app initialization
 */
function loadFromStorage() {
    const stored = localStorage.getItem('neuroPlannerData');
    if (stored) {
        appState = JSON.parse(stored);
        console.log('Data loaded from LocalStorage:', appState);
    } else {
        console.log('No data found in LocalStorage');
    }
}

/**
 * Save all data to LocalStorage
 */
function saveToStorage() {
    localStorage.setItem('neuroPlannerData', JSON.stringify(appState));
}

// ==================== TASK MANAGEMENT ====================

/**
 * Add a new task to the system
 * @param {string} name - Task name
 * @param {string} category - Task category
 * @param {number} energy - Energy level required (1-5)
 * @param {number|null} priority - Priority level (1-3 or null)
 */
function addTask(name, category, energy, priority) {
    // Validation: ensure required fields are present
    if (!name || !category || !energy) {
        alert('Please fill in all required fields (Task Name, Category, and Energy Level)');
        return false;
    }

    const task = {
        id: Date.now().toString(),
        name: name.trim(),
        category: category,
        energy: parseInt(energy),
        priority: priority ? parseInt(priority) : null,
        createdAt: new Date().toISOString()
    };

    appState.tasks.push(task);
    saveToStorage();
    return true;
}

/**
 * Edit an existing task
 * @param {string} id - Task ID
 * @param {object} updates - Updated task properties
 */
function editTask(id, updates) {
    const taskIndex = appState.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        appState.tasks[taskIndex] = {
            ...appState.tasks[taskIndex],
            ...updates
        };
        saveToStorage();
        return true;
    }
    return false;
}

/**
 * Delete a task from the system
 * @param {string} id - Task ID
 */
function deleteTask(id) {
    appState.tasks = appState.tasks.filter(t => t.id !== id);
    saveToStorage();
}

/**
 * Mark task as complete and move to history
 * @param {string} id - Task ID
 */
function completeTask(id) {
    const task = appState.tasks.find(t => t.id === id);
    if (task) {
        // Add completion date and move to history
        const completedTask = {
            ...task,
            completedAt: new Date().toISOString()
        };
        appState.history.unshift(completedTask); // Add to beginning of history
        appState.tasks = appState.tasks.filter(t => t.id !== id);
        saveToStorage();
    }
}

// ==================== TASK ORDERING ALGORITHM ====================

/**
 * Order tasks by energy compatibility and priority
 * Algorithm:
 * 1. Calculate energy compatibility (how close task energy is to user's current energy)
 * 2. Sort by energy compatibility first (closest match first)
 * 3. Then sort by priority (1 = highest priority)
 * 
 * @param {number} currentEnergy - User's current energy level (1-5)
 * @returns {array} Ordered array of tasks
 */
function orderTasks(currentEnergy) {
    if (!currentEnergy || appState.tasks.length === 0) {
        return [];
    }

    // Create a copy to avoid mutating original array
    const tasksWithScore = appState.tasks.map(task => {
        // Energy compatibility: smaller difference = better match
        const energyDiff = Math.abs(task.energy - currentEnergy);
        
        return {
            ...task,
            energyDiff: energyDiff,
            // Priority score: lower number = higher priority (1 is best)
            // If no priority set, treat as lowest priority (4)
            priorityScore: task.priority || 4
        };
    });

    // Sort by energy compatibility first, then by priority
    tasksWithScore.sort((a, b) => {
        // First compare energy difference (lower is better)
        if (a.energyDiff !== b.energyDiff) {
            return a.energyDiff - b.energyDiff;
        }
        // If energy match is same, compare priority (lower number is higher priority)
        return a.priorityScore - b.priorityScore;
    });

    return tasksWithScore;
}

// ==================== UI RENDERING ====================

/**
 * Get emoji number for task ordering
 */
function getNumberEmoji(num) {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[num - 1] || `${num}️⃣`;
}

/**
 * Get category emoji
 */
function getCategoryEmoji(category) {
    const emojis = {
        cooking: '🍳',
        cleaning: '🧹',
        gym: '💪',
        paperwork: '📄',
        other: '📌'
    };
    return emojis[category] || '📌';
}

/**
 * Render the ordered task list
 */
function renderTaskList() {
    const container = document.getElementById('task-list-container');
    
    if (!appState.currentEnergy) {
        container.innerHTML = '<p class="empty-message">Set your energy level to see your optimized task order</p>';
        return;
    }

    const orderedTasks = orderTasks(appState.currentEnergy);
    
    if (orderedTasks.length === 0) {
        container.innerHTML = '<p class="empty-message">No tasks yet. Add your first task below!</p>';
        return;
    }

    container.innerHTML = orderedTasks.map((task, index) => `
        <div class="task-item">
            <div class="task-number">${getNumberEmoji(index + 1)}</div>
            <div class="task-content">
                <div class="task-name">${task.name}</div>
                <div class="task-meta">
                    <span class="task-badge">${getCategoryEmoji(task.category)} ${task.category}</span>
                    <span class="task-badge">⚡ Energy: ${task.energy}</span>
                    ${task.priority ? `<span class="task-badge">⭐ Priority: ${task.priority}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon btn-done" onclick="handleComplete('${task.id}')">✓ Done</button>
                <button class="btn-icon btn-edit" onclick="handleEdit('${task.id}')">✏️ Edit</button>
                <button class="btn-icon btn-delete" onclick="handleDelete('${task.id}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

/**
 * Render the history section
 */
function renderHistory() {
    const container = document.getElementById('history-container');
    
    if (appState.history.length === 0) {
        container.innerHTML = '<p class="empty-message">No completed tasks yet</p>';
        return;
    }

    container.innerHTML = appState.history.map(task => {
        const completedDate = new Date(task.completedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <div class="history-item">
                <div class="task-name">${task.name}</div>
                <div class="task-meta">
                    <span class="task-badge">${getCategoryEmoji(task.category)} ${task.category}</span>
                    <span class="task-badge">⚡ Energy: ${task.energy}</span>
                </div>
                <div class="history-date">Completed on ${completedDate}</div>
            </div>
        `;
    }).join('');
}

/**
 * Update energy display
 */
function updateEnergyDisplay() {
    const display = document.getElementById('current-energy');
    if (appState.currentEnergy) {
        display.textContent = appState.currentEnergy;
        display.style.color = 'var(--accent-dark)';
    } else {
        display.textContent = 'Not set';
        display.style.color = 'var(--text-secondary)';
    }
    
    // Update active button state
    document.querySelectorAll('.energy-btn').forEach(btn => {
        const energy = btn.getAttribute('data-energy');
        if (energy === String(appState.currentEnergy)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Update rating display
 */
function updateRatingDisplay() {
    const display = document.getElementById('current-rating');
    if (appState.dailyRating) {
        display.textContent = `${appState.dailyRating} star${appState.dailyRating > 1 ? 's' : ''}`;
        display.style.color = 'var(--warning)';
    } else {
        display.textContent = 'Not rated';
        display.style.color = 'var(--text-secondary)';
    }
    
    // Update star visual state
    document.querySelectorAll('.star').forEach(star => {
        const rating = parseInt(star.getAttribute('data-rating'));
        if (rating <= appState.dailyRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// ==================== EVENT HANDLERS ====================

/**
 * Handle energy level selection
 */
function handleEnergySelect(energy) {
    appState.currentEnergy = parseInt(energy);
    saveToStorage();
    updateEnergyDisplay();
    renderTaskList();
}

/**
 * Handle task form submission
 */
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('task-name').value;
    const category = document.getElementById('task-category').value;
    const energy = document.getElementById('task-energy').value;
    const priority = document.getElementById('task-priority').value;
    
    if (addTask(name, category, energy, priority)) {
        e.target.reset();
        renderTaskList();
    }
}

/**
 * Handle task completion
 */
function handleComplete(id) {
    if (confirm('Mark this task as completed?')) {
        completeTask(id);
        renderTaskList();
        renderHistory();
    }
}

/**
 * Handle task edit
 */
function handleEdit(id) {
    const task = appState.tasks.find(t => t.id === id);
    if (!task) return;
    
    // Populate edit form
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-name').value = task.name;
    document.getElementById('edit-task-category').value = task.category;
    document.getElementById('edit-task-energy').value = task.energy;
    document.getElementById('edit-task-priority').value = task.priority || '';
    
    // Show modal
    document.getElementById('edit-modal').classList.remove('hidden');
}

/**
 * Handle edit form submission
 */
function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-task-id').value;
    const updates = {
        name: document.getElementById('edit-task-name').value.trim(),
        category: document.getElementById('edit-task-category').value,
        energy: parseInt(document.getElementById('edit-task-energy').value),
        priority: document.getElementById('edit-task-priority').value ? 
                  parseInt(document.getElementById('edit-task-priority').value) : null
    };
    
    if (editTask(id, updates)) {
        document.getElementById('edit-modal').classList.add('hidden');
        renderTaskList();
    }
}

/**
 * Handle task deletion
 */
function handleDelete(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(id);
        renderTaskList();
    }
}

/**
 * Handle star rating selection
 */
function handleRating(rating) {
    appState.dailyRating = parseInt(rating);
    saveToStorage();
    updateRatingDisplay();
}

/**
 * Toggle history visibility
 */
function toggleHistory() {
    const container = document.getElementById('history-container');
    const button = document.getElementById('toggle-history');
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        button.textContent = 'Hide History';
        renderHistory();
    } else {
        container.classList.add('hidden');
        button.textContent = 'Show History';
    }
}

// ==================== INITIALIZATION ====================

/**
 * Initialize the application
 */
function initApp() {
    // Load saved data
    loadFromStorage();
    
    // Set up event listeners
    
    // Energy buttons
    document.querySelectorAll('.energy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleEnergySelect(btn.getAttribute('data-energy'));
        });
    });
    
    // Task form
    document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);
    
    // Edit form
    document.getElementById('edit-form').addEventListener('submit', handleEditSubmit);
    document.getElementById('cancel-edit').addEventListener('click', () => {
        document.getElementById('edit-modal').classList.add('hidden');
    });
    
    // Star rating
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => {
            handleRating(star.getAttribute('data-rating'));
        });
    });
    
    // History toggle
    document.getElementById('toggle-history').addEventListener('click', toggleHistory);
    
    // Close modal on background click
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'edit-modal') {
            document.getElementById('edit-modal').classList.add('hidden');
        }
    });
    
    // Initial render
    updateEnergyDisplay();
    updateRatingDisplay();
    renderTaskList();
    
    // Render history if there is any (even if hidden, so it's ready when toggled)
    if (appState.history.length > 0) {
        renderHistory();
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
