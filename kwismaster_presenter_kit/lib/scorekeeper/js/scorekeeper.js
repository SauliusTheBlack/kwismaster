// Quiz Scorekeeper
// Browser-based scorekeeper using quiz_data.js and localStorage

let teams = [];
let scores = {};
let rounds = [];
let eventName = '';
let currentTab = 'overview';

// Network sync
let networkSync = null;
let networkMode = null; // null, 'display', or 'entry'

// Storage keys
const STORAGE_KEY_TEAMS = 'kwismaster_scorekeeper_teams';
const STORAGE_KEY_SCORES = 'kwismaster_scorekeeper_scores';
const STORAGE_KEY_NETWORK_MODE = 'kwismaster_scorekeeper_network_mode';

// Initialize when data is loaded
function initializeScorekeeper() {
    // Wait for quiz data to be loaded
    if (typeof window.quizEventName === 'undefined' || typeof questions === 'undefined') {
        setTimeout(initializeScorekeeper, 100);
        return;
    }

    eventName = window.quizEventName || 'Quiz';

    // Extract rounds from questions array
    rounds = questions.map(round => round.name);

    // Update event name in header
    document.getElementById('event-name').textContent = eventName;
    document.title = `Scorekeeper - ${eventName}`;

    // Load persisted data
    loadData();

    // Render UI first
    renderTabs();
    renderTabContents();
    showTab('overview');

    // Initialize network sync
    initializeNetworkSync();

    // Check for saved network mode (after UI is rendered)
    const savedMode = localStorage.getItem(STORAGE_KEY_NETWORK_MODE);
    if (savedMode) {
        networkMode = savedMode;
        updateNetworkModeUI();
    }
}

// Initialize network synchronization
function initializeNetworkSync() {
    networkSync = new NetworkSync(
        // On scores update from network
        (newScores) => {
            scores = newScores;
            saveScores();
            renderTabContents();
            showTab(currentTab);
        },
        // On teams update from network
        (newTeams) => {
            teams = newTeams;
            saveTeams();
            renderTabContents();
            showTab(currentTab);
        },
        // On connection status change
        (isConnected) => {
            updateConnectionStatus(isConnected);
        }
    );
}

// Load teams and scores from localStorage
function loadData() {
    const savedTeams = localStorage.getItem(STORAGE_KEY_TEAMS);
    const savedScores = localStorage.getItem(STORAGE_KEY_SCORES);

    if (savedTeams) {
        try {
            teams = JSON.parse(savedTeams);
        } catch (e) {
            console.error('Error loading teams:', e);
            teams = [];
        }
    }

    if (savedScores) {
        try {
            scores = JSON.parse(savedScores);
        } catch (e) {
            console.error('Error loading scores:', e);
            scores = {};
        }
    }
}

// Save teams to localStorage
function saveTeams() {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));

    // Sync to network if in entry mode
    if (networkMode === 'entry' && networkSync) {
        networkSync.sendTeamsUpdate(teams);
    }
}

// Save scores to localStorage
function saveScores() {
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));

    // Sync to network if in entry mode
    if (networkMode === 'entry' && networkSync) {
        networkSync.sendScoresUpdate(scores);
    }
}

// Add a new team
function addTeam() {
    console.log('addTeam called');
    const input = document.getElementById('new-team-name');
    console.log('Input element:', input);

    if (!input) {
        console.error('new-team-name input not found!');
        alert('Error: Input element not found. Please refresh the page.');
        return;
    }

    const teamName = input.value.trim();
    console.log('Team name:', teamName);

    if (!teamName) {
        alert('Please enter a team name');
        return;
    }

    if (teams.includes(teamName)) {
        alert('Team already exists');
        return;
    }

    teams.push(teamName);
    scores[teamName] = {};

    console.log('Team added. Total teams:', teams.length);

    saveTeams();
    saveScores();

    input.value = '';

    renderTabContents();
    showTab(currentTab);
}

// Quick add team with auto-generated name
function quickAddTeam() {
    let counter = 1;
    let teamName;

    do {
        teamName = `Team ${counter}`;
        counter++;
    } while (teams.includes(teamName));

    teams.push(teamName);
    scores[teamName] = {};

    saveTeams();
    saveScores();

    renderTabContents();
    showTab(currentTab);
}

// Delete a team
function deleteTeam(teamName) {
    if (!confirm(`Delete team "${teamName}"?`)) {
        return;
    }

    teams = teams.filter(t => t !== teamName);
    delete scores[teamName];

    saveTeams();
    saveScores();

    renderTabContents();
    showTab(currentTab);
}

// Update score for a team in a round
function updateScore(teamName, roundName, value) {
    if (!scores[teamName]) {
        scores[teamName] = {};
    }

    const numValue = parseInt(value) || 0;
    scores[teamName][roundName] = numValue;

    saveScores();
    updateTotals();
}

// Calculate total score for a team
function calculateTotal(teamName) {
    if (!scores[teamName]) {
        return 0;
    }

    return rounds.reduce((total, round) => {
        return total + (scores[teamName][round] || 0);
    }, 0);
}

// Update all total displays
function updateTotals() {
    teams.forEach(teamName => {
        const total = calculateTotal(teamName);
        const totalElements = document.querySelectorAll(`[data-total="${teamName}"]`);
        totalElements.forEach(el => {
            el.textContent = total;
        });
    });
}

// Render tabs
function renderTabs() {
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = '';

    // Overview tab
    const overviewTab = document.createElement('div');
    overviewTab.className = 'tab';
    overviewTab.textContent = 'Overview';
    overviewTab.onclick = () => showTab('overview');
    tabsContainer.appendChild(overviewTab);

    // Round tabs
    rounds.forEach(round => {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.textContent = round;
        tab.onclick = () => showTab(round);
        tabsContainer.appendChild(tab);
    });
}

// Render tab contents
function renderTabContents() {
    const container = document.getElementById('tab-contents');
    container.innerHTML = '';

    // Overview tab content
    const overviewContent = createOverviewContent();
    container.appendChild(overviewContent);

    // Round tab contents
    rounds.forEach(round => {
        const roundContent = createRoundContent(round);
        container.appendChild(roundContent);
    });

    // Update network mode UI after rendering (to apply disabled state if needed)
    if (networkMode) {
        updateNetworkModeUI();
    }
}

// Create overview tab content
function createOverviewContent() {
    const div = document.createElement('div');
    div.className = 'tab-content';
    div.id = 'tab-overview';

    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h2');
    title.textContent = 'All Scores - Overview';
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'score-table overview-table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const thTeam = document.createElement('th');
    thTeam.textContent = 'Team';
    headerRow.appendChild(thTeam);

    rounds.forEach(round => {
        const th = document.createElement('th');
        th.textContent = round;
        headerRow.appendChild(th);
    });

    const thTotal = document.createElement('th');
    thTotal.className = 'total-column';
    thTotal.textContent = 'Total';
    headerRow.appendChild(thTotal);

    const thActions = document.createElement('th');
    thActions.textContent = 'Actions';
    headerRow.appendChild(thActions);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');

    if (teams.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = rounds.length + 3;
        emptyCell.textContent = 'No teams yet. Add teams using the form below.';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '2rem';
        emptyCell.style.color = 'var(--color-text-secondary)';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
    } else {
        teams.forEach(teamName => {
            const row = document.createElement('tr');

            const tdTeam = document.createElement('td');
            tdTeam.className = 'team-name';
            tdTeam.textContent = teamName;
            row.appendChild(tdTeam);

            rounds.forEach(round => {
                const td = document.createElement('td');
                td.className = 'score-display';
                const score = scores[teamName]?.[round];
                td.textContent = score !== undefined ? score : '-';
                row.appendChild(td);
            });

            const tdTotal = document.createElement('td');
            tdTotal.className = 'total-score';
            tdTotal.setAttribute('data-total', teamName);
            tdTotal.textContent = calculateTotal(teamName);
            row.appendChild(tdTotal);

            const tdActions = document.createElement('td');
            tdActions.className = 'actions';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => deleteTeam(teamName);
            tdActions.appendChild(deleteBtn);
            row.appendChild(tdActions);

            tbody.appendChild(row);
        });
    }

    table.appendChild(tbody);
    card.appendChild(table);
    div.appendChild(card);

    return div;
}

// Create round tab content
function createRoundContent(roundName) {
    const div = document.createElement('div');
    div.className = 'tab-content';
    div.id = `tab-${roundName}`;

    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h2');
    title.textContent = roundName;
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'score-table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const thTeam = document.createElement('th');
    thTeam.textContent = 'Team';
    headerRow.appendChild(thTeam);

    const thScore = document.createElement('th');
    thScore.textContent = 'Score';
    headerRow.appendChild(thScore);

    const thTotal = document.createElement('th');
    thTotal.textContent = 'Total';
    headerRow.appendChild(thTotal);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');

    if (teams.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 3;
        emptyCell.textContent = 'No teams yet. Add teams using the form below.';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '2rem';
        emptyCell.style.color = 'var(--color-text-secondary)';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
    } else {
        teams.forEach(teamName => {
            const row = document.createElement('tr');

            const tdTeam = document.createElement('td');
            tdTeam.className = 'team-name';
            tdTeam.textContent = teamName;
            row.appendChild(tdTeam);

            const tdScore = document.createElement('td');
            tdScore.className = 'score-input';
            const input = document.createElement('input');
            input.type = 'number';
            input.value = scores[teamName]?.[roundName] || '';
            input.placeholder = '0';
            input.oninput = (e) => {
                updateScore(teamName, roundName, e.target.value);
            };
            tdScore.appendChild(input);
            row.appendChild(tdScore);

            const tdTotal = document.createElement('td');
            tdTotal.className = 'total-score';
            tdTotal.setAttribute('data-total', teamName);
            tdTotal.textContent = calculateTotal(teamName);
            row.appendChild(tdTotal);

            tbody.appendChild(row);
        });
    }

    table.appendChild(tbody);
    card.appendChild(table);
    div.appendChild(card);

    return div;
}

// Show a specific tab
function showTab(tabName) {
    currentTab = tabName;

    // Update tab highlights
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        if ((index === 0 && tabName === 'overview') || tab.textContent === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Show/hide content
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.style.display = 'none';
    });

    const targetId = tabName === 'overview' ? 'tab-overview' : `tab-${tabName}`;
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
        targetContent.style.display = 'block';
    }
}

// Export scores to JSON file
function exportScores() {
    const data = {
        event: eventName,
        exportDate: new Date().toISOString(),
        teams: teams,
        scores: scores,
        rounds: rounds
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `scores_${eventName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import scores
function importScores() {
    document.getElementById('import-file').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (confirm(`Import scores from "${data.event}"? This will replace current teams and scores.`)) {
                teams = data.teams || [];
                scores = data.scores || {};

                saveTeams();
                saveScores();

                renderTabContents();
                showTab(currentTab);

                alert('Scores imported successfully!');
            }
        } catch (error) {
            alert('Error importing scores: ' + error.message);
        }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}

// Reset all scores
function resetAllScores() {
    if (!confirm('Reset all scores and delete all teams? This cannot be undone!')) {
        return;
    }

    if (!confirm('Are you absolutely sure? All data will be lost!')) {
        return;
    }

    teams = [];
    scores = {};

    saveTeams();
    saveScores();

    renderTabContents();
    showTab('overview');

    alert('All scores and teams have been reset.');
}

// Network mode functions
function setNetworkMode(mode) {
    networkMode = mode;
    localStorage.setItem(STORAGE_KEY_NETWORK_MODE, mode);
    updateNetworkModeUI();

    if (mode === 'display') {
        startDisplayMode();
    } else if (mode === 'entry') {
        startEntryMode();
    }
}

function clearNetworkMode() {
    networkMode = null;
    localStorage.removeItem(STORAGE_KEY_NETWORK_MODE);
    if (networkSync) {
        networkSync.disconnect();
    }
    updateNetworkModeUI();
    hideNetworkDialog();
}

async function startDisplayMode() {
    try {
        console.log('Starting display mode...');

        // Ensure networkSync is initialized
        if (!networkSync) {
            console.log('networkSync not initialized, initializing now...');
            initializeNetworkSync();
        }

        if (!networkSync) {
            throw new Error('Failed to initialize network sync. Please refresh the page.');
        }

        const connectionCode = await networkSync.initializeAsDisplay();
        console.log('Connection code generated:', connectionCode.substring(0, 50) + '...');
        showConnectionCode(connectionCode);
    } catch (error) {
        console.error('Error starting display mode:', error);
        alert('Error starting display mode: ' + error.message);
        clearNetworkMode();
    }
}

function startEntryMode() {
    showEntryCodePrompt();
}

async function connectWithCode(offerCode) {
    try {
        // Ensure networkSync is initialized
        if (!networkSync) {
            console.log('networkSync not initialized, initializing now...');
            initializeNetworkSync();
        }

        if (!networkSync) {
            throw new Error('Failed to initialize network sync. Please refresh the page.');
        }

        const answerCode = await networkSync.initializeAsEntry(offerCode);
        showAnswerCode(answerCode);

        // Send initial sync
        setTimeout(() => {
            networkSync.sendFullSync(teams, scores);
        }, 1000);
    } catch (error) {
        console.error('Error connecting:', error);
        alert('Error connecting: ' + error.message);
    }
}

async function completeDisplayConnection(answerCode) {
    try {
        // Ensure networkSync is initialized
        if (!networkSync) {
            console.log('networkSync not initialized, initializing now...');
            initializeNetworkSync();
        }

        if (!networkSync) {
            throw new Error('Failed to initialize network sync. Please refresh the page.');
        }

        await networkSync.completeConnection(answerCode);
        closeAllDialogs();
        alert('Connection established! Scores will sync automatically.');
    } catch (error) {
        console.error('Error completing connection:', error);
        alert('Error completing connection: ' + error.message);
    }
}

function updateConnectionStatus(isConnected) {
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
        if (isConnected) {
            indicator.className = 'connection-indicator connected';
            indicator.textContent = `Connected (${networkMode === 'display' ? 'Display' : 'Entry'} Mode)`;
        } else {
            indicator.className = 'connection-indicator disconnected';
            indicator.textContent = networkMode ? `Disconnected (${networkMode} Mode)` : 'Not Connected';
        }
    }
}

function updateNetworkModeUI() {
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
        if (networkMode) {
            indicator.className = 'connection-indicator disconnected';
            indicator.textContent = `Disconnected (${networkMode} Mode)`;
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    // Disable team/score editing in display mode
    const isReadOnly = networkMode === 'display';
    document.querySelectorAll('.score-input input').forEach(input => {
        input.disabled = isReadOnly;
    });
    document.querySelectorAll('.team-management input, .team-management button').forEach(el => {
        el.disabled = isReadOnly;
    });
}

// Dialog functions
function showNetworkDialog() {
    const dialog = document.getElementById('network-dialog');
    dialog.style.display = 'flex';
}

function hideNetworkDialog() {
    const dialog = document.getElementById('network-dialog');
    dialog.style.display = 'none';
}

// Store connection data for file-based pairing
let pendingPairData = null;
let pendingPair2Data = null;

function showConnectionCode(code) {
    hideNetworkDialog();
    pendingPairData = code;
    const dialog = document.getElementById('connection-code-dialog');
    dialog.style.display = 'flex';
}

function showEntryCodePrompt() {
    hideNetworkDialog();
    const dialog = document.getElementById('entry-code-dialog');
    dialog.style.display = 'flex';
}

function showAnswerCode(code) {
    pendingPair2Data = code;
    const dialog = document.getElementById('answer-code-dialog');
    dialog.style.display = 'flex';
}

function downloadPairFile() {
    if (!pendingPairData) {
        alert('No pairing data available. Please try again.');
        return;
    }

    const blob = new Blob([pendingPairData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scorekeeper.pair';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadPair2File() {
    if (!pendingPair2Data) {
        alert('No response data available. Please try again.');
        return;
    }

    const blob = new Blob([pendingPair2Data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scorekeeper.pair2';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handlePairUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const code = e.target.result;
        connectWithCode(code);
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

function handlePair2Upload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const code = e.target.result;
        completeDisplayConnection(code);
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

function closeAllDialogs() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScorekeeper);
} else {
    initializeScorekeeper();
}
