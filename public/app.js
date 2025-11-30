// API Configuration
const API_URL = 'http://localhost:5000/api';

// State
let currentUser = null;
let token = localStorage.getItem('habitTrackerToken');
let habits = [];
let selectedColor = '#667eea';
let currentFilter = 'all';
let currentTab = 'login';

const categoryInfo = {
    health: { icon: '🏃', name: 'Health & Fitness', color: '#43e97b' },
    productivity: { icon: '💼', name: 'Productivity', color: '#667eea' },
    learning: { icon: '📚', name: 'Learning', color: '#4facfe' },
    mindfulness: { icon: '🧘', name: 'Mindfulness', color: '#f093fb' },
    social: { icon: '👥', name: 'Social', color: '#fa709a' },
    finance: { icon: '💰', name: 'Finance', color: '#feca57' },
    creativity: { icon: '🎨', name: 'Creativity', color: '#ff6348' },
    other: { icon: '📌', name: 'Other', color: '#5f27cd' }
};

// Initialize
if (token) {
    verifyToken();
}

// Color picker
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        selectedColor = this.dataset.color;
    });
});

// API Helper Functions
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication Functions
function switchTab(tab) {
    currentTab = tab;
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    const emailInput = document.getElementById('email');
    const displayNameInput = document.getElementById('displayName');
    const loginBtn = document.querySelector('.login-btn');

    if (tab === 'signup') {
        emailInput.style.display = 'block';
        displayNameInput.style.display = 'block';
        loginBtn.textContent = 'Sign Up';
    } else {
        emailInput.style.display = 'none';
        displayNameInput.style.display = 'none';
        loginBtn.textContent = 'Login';
    }

    document.getElementById('errorMsg').textContent = '';
}

async function handleAuth() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const email = document.getElementById('email').value.trim();
    const displayName = document.getElementById('displayName').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.textContent = '';

    if (!username || !password) {
        errorMsg.textContent = 'Please enter username and password';
        return;
    }

    try {
        let data;
        if (currentTab === 'signup') {
            if (!email || !displayName) {
                errorMsg.textContent = 'Please fill all fields';
                return;
            }
            data = await apiCall('/auth/register', 'POST', { username, email, password, displayName });
        } else {
            data = await apiCall('/auth/login', 'POST', { username, password });
        }

        token = data.token;
        currentUser = data.user;
        localStorage.setItem('habitTrackerToken', token);
        showApp();
    } catch (error) {
        errorMsg.textContent = error.message;
    }
}

async function verifyToken() {
    try {
        const user = await apiCall('/auth/me');
        currentUser = user;
        showApp();
    } catch (error) {
        logout();
    }
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    
    document.getElementById('displayNameText').textContent = currentUser.displayName;
    document.getElementById('userAvatar').textContent = currentUser.displayName.charAt(0).toUpperCase();
    
    loadHabits();
}

function logout() {
    token = null;
    currentUser = null;
    habits = [];
    localStorage.removeItem('habitTrackerToken');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('displayName').value = '';
}

// Habit Functions
async function loadHabits() {
    try {
        habits = await apiCall('/habits');
        renderHabits();
        updateStats();
    } catch (error) {
        console.error('Error loading habits:', error);
    }
}

async function addHabit() {
    const name = document.getElementById('habitName').value.trim();
    const category = document.getElementById('habitCategory').value;
    const frequency = document.getElementById('habitFrequency').value;

    if (!name) {
        alert('Please enter a habit name');
        return;
    }

    try {
        const newHabit = await apiCall('/habits', 'POST', {
            name,
            category,
            frequency,
            color: selectedColor
        });

        habits.push(newHabit);
        document.getElementById('habitName').value = '';
        renderHabits();
        updateStats();
    } catch (error) {
        alert('Error creating habit: ' + error.message);
    }
}

async function deleteHabit(id) {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
        await apiCall(`/habits/${id}`, 'DELETE');
        habits = habits.filter(h => h._id !== id);
        renderHabits();
        updateStats();
    } catch (error) {
        alert('Error deleting habit: ' + error.message);
    }
}

async function toggleCompletion(habitId, date) {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (dateStr > today) return;

    try {
        const updatedHabit = await apiCall(`/habits/${habitId}/complete`, 'POST', { date: dateStr });
        const index = habits.findIndex(h => h._id === habitId);
        if (index !== -1) {
            habits[index] = updatedHabit;
        }
        renderHabits();
        updateStats();
    } catch (error) {
        console.error('Error toggling completion:', error);
    }
}

function calculateStreak(completions) {
    if (completions.length === 0) return 0;

    const sorted = completions.sort().reverse();
    let streak = 0;

    for (let i = 0; i < sorted.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (sorted[i] === expectedDateStr) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function renderHabits() {
    const container = document.getElementById('categoriesContainer');
    const filteredHabits = currentFilter === 'all' 
        ? habits 
        : habits.filter(h => h.frequency === currentFilter);

    if (filteredHabits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No habits found</h3>
                <p>${currentFilter === 'all' ? 'Start building better habits by adding your first one above!' : `No ${currentFilter} habits yet.`}</p>
            </div>
        `;
        return;
    }

    const groupedHabits = {};
    filteredHabits.forEach(habit => {
        if (!groupedHabits[habit.category]) {
            groupedHabits[habit.category] = [];
        }
        groupedHabits[habit.category].push(habit);
    });

    container.innerHTML = Object.keys(groupedHabits).map(category => {
        const categoryHabits = groupedHabits[category];
        const catInfo = categoryInfo[category];

        return `
            <div class="category-section">
                <div class="category-header" style="background: ${catInfo.color};">
                    <div class="category-title">
                        <span>${catInfo.icon}</span>
                        <span>${catInfo.name}</span>
                    </div>
                    <div class="category-count">${categoryHabits.length} habit${categoryHabits.length !== 1 ? 's' : ''}</div>
                </div>
                <div class="habits-grid">
                    ${categoryHabits.map(habit => renderHabitCard(habit)).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderHabitCard(habit) {
    const streak = calculateStreak(habit.completions);
    const today = new Date().toISOString().split('T')[0];
    
    const days = [];
    for (let i = 27; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date);
    }

    const completionRate = days.length > 0 
        ? (days.filter(d => habit.completions.includes(d.toISOString().split('T')[0])).length / days.length * 100).toFixed(0)
        : 0;

    return `
        <div class="habit-card">
            <div class="habit-header">
                <div class="habit-title">
                    <div class="habit-color" style="background: ${habit.color};"></div>
                    <span class="habit-name">${habit.name}</span>
                </div>
                <div class="habit-actions">
                    <button class="delete-btn" onclick="deleteHabit('${habit._id}')">Delete</button>
                </div>
            </div>
            <div class="habit-info">
                <div class="habit-streak">
                    <span>🔥 ${streak} day streak</span>
                </div>
                <div>📊 ${completionRate}% completion</div>
                <div>📅 ${habit.frequency}</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${completionRate}%;"></div>
            </div>
            <div class="calendar-grid">
                ${days.map(date => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isCompleted = habit.completions.includes(dateStr);
                    const isToday = dateStr === today;
                    const isFuture = date > new Date();
                    const dayNum = date.getDate();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                    return `
                        <div class="calendar-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}"
                             onclick="${!isFuture ? `toggleCompletion('${habit._id}', new Date('${date.toISOString()}'))` : ''}">
                            <div class="day-number">${dayNum}</div>
                            <div class="day-label">${dayName}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completions.includes(today)).length;
    const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
    const maxStreak = Math.max(0, ...habits.map(h => calculateStreak(h.completions)));

    document.getElementById('totalHabits').textContent = habits.length;
    document.getElementById('completedToday').textContent = completedToday;
    document.getElementById('currentStreak').textContent = maxStreak;
    document.getElementById('totalCompletions').textContent = totalCompletions;
}

function filterHabits(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderHabits();
}

// Enter key support
document.getElementById('habitName')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addHabit();
    }
});

document.getElementById('password')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleAuth();
    }
});
