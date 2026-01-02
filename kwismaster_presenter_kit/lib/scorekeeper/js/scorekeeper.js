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

// Storage keys (will be set per event)
let STORAGE_KEY_TEAMS = 'kwismaster_scorekeeper_teams';
let STORAGE_KEY_SCORES = 'kwismaster_scorekeeper_scores';
let STORAGE_KEY_NETWORK_MODE = 'kwismaster_scorekeeper_network_mode';

// Initialize when data is loaded
function initializeScorekeeper() {
    // Wait for quiz data to be loaded
    if (typeof questions === 'undefined' || typeof settings === 'undefined') {
        setTimeout(initializeScorekeeper, 100);
        return;
    }

    // Get event name from settings (new format) or fallback to window.quizEventName (KWON format) or default
    eventName = (settings && settings.eventName) || window.quizEventName || 'Quiz';

    // Set event-specific storage keys
    const eventSlug = eventName.toLowerCase().replace(/\s+/g, '_');
    STORAGE_KEY_TEAMS = `kwismaster_scorekeeper_${eventSlug}_teams`;
    STORAGE_KEY_SCORES = `kwismaster_scorekeeper_${eventSlug}_scores`;
    STORAGE_KEY_NETWORK_MODE = `kwismaster_scorekeeper_${eventSlug}_network_mode`;

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

    // Check for saved network mode
    const savedMode = localStorage.getItem(STORAGE_KEY_NETWORK_MODE);
    if (savedMode) {
        networkMode = savedMode;
        updateNetworkModeUI();

        // Note: WebRTC connections cannot persist across page refreshes
        // Users will need to reconnect manually after refresh
        console.log('Network mode restored:', networkMode);
        console.log('Note: You will need to reconnect after page refresh');
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

        // Show presentation configuration dialog for Display mode
        showPresentationConfig();
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
            indicator.style.display = 'block';
        } else {
            indicator.className = 'connection-indicator disconnected';
            indicator.textContent = networkMode ? `Disconnected (${networkMode} Mode)` : 'Not Connected';
            indicator.style.display = networkMode ? 'block' : 'none';
        }
    }
}

function updateNetworkModeUI() {
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
        if (networkMode) {
            // Check actual connection state
            const isConnected = networkSync && networkSync.isConnected;
            if (isConnected) {
                indicator.className = 'connection-indicator connected';
                indicator.textContent = `Connected (${networkMode === 'display' ? 'Display' : 'Entry'} Mode)`;
            } else {
                indicator.className = 'connection-indicator disconnected';
                indicator.textContent = `Disconnected (${networkMode} Mode)`;
            }
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


// Warn before page refresh if connected
window.addEventListener('beforeunload', (event) => {
    // Only warn if network connection is active
    if (networkSync && networkSync.isConnected) {
        const message = 'You are currently connected. Refreshing will disconnect the network sync and you will need to re-pair the devices.';
        event.preventDefault();
        event.returnValue = message; // Standard way to show warning
        return message; // For older browsers
    }
});

// ========================================
// Presentation Mode Functions
// ========================================

let presentationConfig = {
    selectedRounds: [],
    timerDuration: 30,
    isActive: false,
    currentPage: 0,
    pages: [],
    timerInterval: null,
    remainingTime: 0
};

function showPresentationConfig() {
    const dialog = document.getElementById('presentation-config-dialog');
    const roundList = document.getElementById('round-selector-list');

    // Populate round checkboxes
    roundList.innerHTML = '';
    rounds.forEach(round => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = 'var(--spacing-sm)';
        label.style.cursor = 'pointer';
        label.style.padding = 'var(--spacing-sm)';
        label.style.borderRadius = 'var(--radius-sm)';
        label.style.transition = 'background-color 0.2s';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = round;
        checkbox.checked = true; // Default all selected
        checkbox.style.cursor = 'pointer';

        const text = document.createTextNode(round);

        label.appendChild(checkbox);
        label.appendChild(text);
        label.onmouseover = () => label.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
        label.onmouseout = () => label.style.backgroundColor = 'transparent';

        roundList.appendChild(label);
    });

    dialog.style.display = 'flex';
}

function closePresentationConfig() {
    const dialog = document.getElementById('presentation-config-dialog');
    dialog.style.display = 'none';
}

function startPresentation() {
    // Get selected rounds
    const checkboxes = document.querySelectorAll('#round-selector-list input[type="checkbox"]:checked');
    presentationConfig.selectedRounds = Array.from(checkboxes).map(cb => cb.value);

    if (presentationConfig.selectedRounds.length === 0) {
        alert('Please select at least one round to display.');
        return;
    }

    // Get timer duration
    const timerInput = document.getElementById('presentation-timer');
    presentationConfig.timerDuration = parseInt(timerInput.value) || 30;

    // Close config dialog
    closePresentationConfig();

    // Hide main container
    document.querySelector('.container').style.display = 'none';

    // Generate presentation pages
    generatePresentationPages();

    // Show presentation view
    const presentationView = document.getElementById('presentation-view');
    presentationView.style.display = 'block';

    // Set event name
    document.getElementById('presentation-event-name').textContent = eventName;

    // Start presentation
    presentationConfig.isActive = true;
    presentationConfig.currentPage = 0;
    showPresentationPage(0);
}

function generatePresentationPages() {
    // Sort teams by total score (descending)
    const sortedTeams = [...teams].sort((a, b) => {
        const totalA = calculateTotalForSelectedRounds(a);
        const totalB = calculateTotalForSelectedRounds(b);
        return totalB - totalA;
    });

    // Calculate how many teams fit per page
    const teamsPerPage = calculateTeamsPerPage();

    // Split teams into pages
    presentationConfig.pages = [];
    for (let i = 0; i < sortedTeams.length; i += teamsPerPage) {
        presentationConfig.pages.push(sortedTeams.slice(i, i + teamsPerPage));
    }

    // If no teams, create one empty page
    if (presentationConfig.pages.length === 0) {
        presentationConfig.pages.push([]);
    }
}

function calculateTeamsPerPage() {
    // Get viewport height
    const viewportHeight = window.innerHeight;

    // Account for header (70px) and padding (2 * spacing-xl = 2 * 32px = 64px)
    const availableHeight = viewportHeight - 70 - 64;

    // Estimate row height: ~60px per row (including header ~70px)
    const headerHeight = 70;
    const rowHeight = 60;

    // Calculate teams that fit
    const teamsPerPage = Math.floor((availableHeight - headerHeight) / rowHeight);

    // Clamp between 5 and 20
    return Math.max(5, Math.min(20, teamsPerPage));
}

function calculateTotalForSelectedRounds(teamName) {
    if (!scores[teamName]) {
        return 0;
    }

    return presentationConfig.selectedRounds.reduce((total, round) => {
        return total + (scores[teamName][round] || 0);
    }, 0);
}

function showPresentationPage(pageIndex) {
    const content = document.getElementById('presentation-content');
    const pageTeams = presentationConfig.pages[pageIndex] || [];

    // Create table
    let html = '<div class="card" style="margin: 0;"><table class="score-table presentation-table" style="font-size: 1.2rem;">';

    // Header
    html += '<thead><tr>';
    html += '<th style="width: 50px; text-align: center;">#</th>';
    html += '<th>Team</th>';

    presentationConfig.selectedRounds.forEach(round => {
        html += `<th style="text-align: center;">${round}</th>`;
    });

    html += '<th style="text-align: center; font-size: 1.3rem;">Total</th>';
    html += '</tr></thead>';

    // Body
    html += '<tbody>';

    if (pageTeams.length === 0) {
        html += '<tr><td colspan="' + (presentationConfig.selectedRounds.length + 3) + '" style="text-align: center; padding: 3rem; color: var(--color-text-secondary);">No teams yet</td></tr>';
    } else {
        pageTeams.forEach((teamName, index) => {
            const globalRank = (pageIndex * calculateTeamsPerPage()) + index + 1;
            const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';

            html += `<tr class="${rowClass}">`;
            html += `<td style="text-align: center; font-weight: 600; color: var(--color-text-secondary);">${globalRank}</td>`;
            html += `<td style="font-weight: 600;">${teamName}</td>`;

            presentationConfig.selectedRounds.forEach(round => {
                const score = scores[teamName]?.[round];
                html += `<td style="text-align: center;">${score !== undefined ? score : '-'}</td>`;
            });

            const total = calculateTotalForSelectedRounds(teamName);
            html += `<td style="text-align: center; font-weight: 700; color: var(--color-primary); font-size: 1.4rem;">${total}</td>`;
            html += '</tr>';
        });
    }

    html += '</tbody></table></div>';

    content.innerHTML = html;

    // Update page indicator
    const totalPages = presentationConfig.pages.length;
    document.getElementById('presentation-page-indicator').textContent = `Page ${pageIndex + 1} of ${totalPages}`;

    // Start timer
    startPresentationTimer();
}

function startPresentationTimer() {
    // Clear existing timer
    if (presentationConfig.timerInterval) {
        clearInterval(presentationConfig.timerInterval);
    }

    presentationConfig.remainingTime = presentationConfig.timerDuration;
    updateTimerDisplay();

    presentationConfig.timerInterval = setInterval(() => {
        presentationConfig.remainingTime--;

        if (presentationConfig.remainingTime <= 0) {
            // Move to next page
            nextPresentationPage();
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const display = document.getElementById('presentation-timer-display');
    const minutes = Math.floor(presentationConfig.remainingTime / 60);
    const seconds = presentationConfig.remainingTime % 60;
    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function nextPresentationPage() {
    presentationConfig.currentPage++;

    // Loop back to first page
    if (presentationConfig.currentPage >= presentationConfig.pages.length) {
        presentationConfig.currentPage = 0;
    }

    showPresentationPage(presentationConfig.currentPage);
}

function stopPresentation() {
    // Stop timer
    if (presentationConfig.timerInterval) {
        clearInterval(presentationConfig.timerInterval);
        presentationConfig.timerInterval = null;
    }

    // Hide presentation view
    document.getElementById('presentation-view').style.display = 'none';

    // Show main container
    document.querySelector('.container').style.display = 'block';

    presentationConfig.isActive = false;
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScorekeeper);
} else {
    initializeScorekeeper();
}
