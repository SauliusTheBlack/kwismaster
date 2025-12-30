let questions = [];
let rounds = [];
let categories = [];
let editingIndex = null;
let currentEvent = null;
let events = [];

function loadEvents() {
    const savedEvents = localStorage.getItem('kwismaster_events');
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    }

    const savedCurrentEvent = localStorage.getItem('kwismaster_current_event');
    if (savedCurrentEvent) {
        currentEvent = savedCurrentEvent;
    }

    renderEventSelector();

    if (currentEvent) {
        loadEventData();
    }
}

function loadEventData() {
    if (!currentEvent) return;

    const saved = localStorage.getItem(`kwismaster_${currentEvent}_questions`);
    if (saved) {
        questions = JSON.parse(saved);
    } else {
        questions = [];
    }

    const savedRounds = localStorage.getItem(`kwismaster_${currentEvent}_rounds`);
    if (savedRounds) {
        rounds = JSON.parse(savedRounds);
    } else {
        rounds = [];
    }

    const savedCategories = localStorage.getItem(`kwismaster_${currentEvent}_categories`);
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    } else {
        categories = [];
    }

    renderQuestions();
}

function saveQuestions() {
    if (!currentEvent) return;
    localStorage.setItem(`kwismaster_${currentEvent}_questions`, JSON.stringify(questions));
}

function saveRounds() {
    if (!currentEvent) return;
    localStorage.setItem(`kwismaster_${currentEvent}_rounds`, JSON.stringify(rounds));
}

function saveCategories() {
    if (!currentEvent) return;
    localStorage.setItem(`kwismaster_${currentEvent}_categories`, JSON.stringify(categories));
}

function saveEvents() {
    localStorage.setItem('kwismaster_events', JSON.stringify(events));
}

function saveCurrentEvent() {
    localStorage.setItem('kwismaster_current_event', currentEvent);
}

function renderEventSelector() {
    const select = document.getElementById('event-select');
    select.innerHTML = '<option value="">Select event...</option>';

    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event;
        option.textContent = event;
        if (event === currentEvent) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function createNewEvent() {
    const eventName = prompt('Enter event name:');
    if (!eventName || !eventName.trim()) {
        return;
    }

    const trimmedName = eventName.trim();
    if (events.includes(trimmedName)) {
        alert('Event already exists!');
        return;
    }

    events.push(trimmedName);
    saveEvents();

    currentEvent = trimmedName;
    saveCurrentEvent();

    questions = [];
    rounds = [];
    categories = [];

    renderEventSelector();
    renderQuestions();
}

function switchEvent() {
    const select = document.getElementById('event-select');
    const newEvent = select.value;

    if (!newEvent) {
        currentEvent = null;
        questions = [];
        rounds = [];
        categories = [];
        renderQuestions();
        return;
    }

    currentEvent = newEvent;
    saveCurrentEvent();
    loadEventData();
}

function renderQuestions() {
    const container = document.getElementById('questions-container');

    if (!currentEvent) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Please select or create an event first</p>
            </div>
        `;
        return;
    }

    if (questions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No questions yet for ${currentEvent}</p>
                <button class="btn-primary" onclick="addNewQuestion()">Create your first question</button>
            </div>
        `;
        return;
    }

    const questionsByRound = {};
    questions.forEach((question, index) => {
        const roundName = question.round || 'Unassigned';
        if (!questionsByRound[roundName]) {
            questionsByRound[roundName] = [];
        }
        questionsByRound[roundName].push({ question, index });
    });

    const sortedRounds = Object.keys(questionsByRound).sort((a, b) => {
        if (a === 'Unassigned') return 1;
        if (b === 'Unassigned') return -1;

        const aIndex = rounds.indexOf(a);
        const bIndex = rounds.indexOf(b);

        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';

    const allInput = document.createElement('input');
    allInput.type = 'radio';
    allInput.name = 'round-tab';
    allInput.id = 'tab-all';
    allInput.checked = true;
    tabsContainer.appendChild(allInput);

    const allLabel = document.createElement('label');
    allLabel.htmlFor = 'tab-all';
    allLabel.className = 'tab-label';
    allLabel.textContent = 'All';
    tabsContainer.appendChild(allLabel);

    sortedRounds.forEach((roundName, idx) => {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'round-tab';
        input.id = `tab-${idx}`;
        tabsContainer.appendChild(input);

        const label = document.createElement('label');
        label.htmlFor = `tab-${idx}`;
        label.className = 'tab-label';
        label.textContent = roundName;
        tabsContainer.appendChild(label);
    });

    container.innerHTML = '';
    container.appendChild(tabsContainer);

    const allContent = document.createElement('div');
    allContent.className = 'tab-content active';
    allContent.id = 'content-all';

    sortedRounds.forEach(roundName => {
        const roundSection = document.createElement('div');
        roundSection.className = 'round-section';

        const roundHeader = document.createElement('h3');
        roundHeader.className = 'round-header';
        roundHeader.textContent = roundName;
        roundSection.appendChild(roundHeader);

        const sortedQuestions = questionsByRound[roundName].sort((a, b) => {
            const catA = a.question.category || '';
            const catB = b.question.category || '';
            return catA.localeCompare(catB);
        });

        const grid = document.createElement('div');
        grid.className = 'questions-grid';

        sortedQuestions.forEach(({ question, index }) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.onclick = () => editQuestion(index);

            card.innerHTML = `
                ${question.category ? `<div class="category">${question.category}</div>` : '<div class="category">No category</div>'}
                <div class="short-question">${question.shortQuestion || question.longQuestion || 'Untitled Question'}</div>
            `;

            grid.appendChild(card);
        });

        roundSection.appendChild(grid);
        allContent.appendChild(roundSection);
    });

    container.appendChild(allContent);

    sortedRounds.forEach((roundName, idx) => {
        const roundContent = document.createElement('div');
        roundContent.className = 'tab-content';
        roundContent.id = `content-${idx}`;

        const sortedQuestions = questionsByRound[roundName].sort((a, b) => {
            const catA = a.question.category || '';
            const catB = b.question.category || '';
            return catA.localeCompare(catB);
        });

        const grid = document.createElement('div');
        grid.className = 'questions-grid';

        sortedQuestions.forEach(({ question, index }) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.onclick = () => editQuestion(index);

            card.innerHTML = `
                ${question.category ? `<div class="category">${question.category}</div>` : '<div class="category">No category</div>'}
                <div class="short-question">${question.shortQuestion || question.longQuestion || 'Untitled Question'}</div>
            `;

            grid.appendChild(card);
        });

        roundContent.appendChild(grid);
        container.appendChild(roundContent);
    });

    setupTabs();
}

function setupTabs() {
    const tabs = document.querySelectorAll('input[name="round-tab"]');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab) => {
        tab.addEventListener('change', function() {
            if (this.checked) {
                contents.forEach(c => c.classList.remove('active'));
                const contentId = 'content-' + this.id.replace('tab-', '');
                const targetContent = document.getElementById(contentId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            }
        });
    });
}

function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewName).classList.add('active');
}

function addNewQuestion() {
    if (!currentEvent) {
        alert('Please select or create an event first');
        return;
    }

    editingIndex = null;
    clearForm();
    populateDropdowns();
    document.getElementById('delete-btn').style.display = 'none';
    showView('form-view');
    document.getElementById('form-title').textContent = 'Add Question';
}

function editQuestion(index) {
    editingIndex = index;
    const question = questions[index];

    populateDropdowns();

    document.getElementById('longQuestion').value = question.longQuestion || '';
    document.getElementById('shortQuestion').value = question.shortQuestion || '';
    document.getElementById('answer').value = question.answer || '';
    document.getElementById('category').value = question.category || '';
    document.getElementById('round').value = question.round || '';
    document.getElementById('image').value = question.img || '';

    document.getElementById('delete-btn').style.display = 'block';
    showView('form-view');

    updateNavigationButtons();
}

function clearForm() {
    document.getElementById('longQuestion').value = '';
    document.getElementById('shortQuestion').value = '';
    document.getElementById('answer').value = '';
    document.getElementById('category').value = '';
    document.getElementById('round').value = '';
    document.getElementById('image').value = '';
}

function populateDropdowns() {
    const roundSelect = document.getElementById('round');
    const categorySelect = document.getElementById('category');

    const currentRound = roundSelect.value;
    const currentCategory = categorySelect.value;

    roundSelect.innerHTML = '<option value="">Select a round...</option>';
    rounds.forEach(round => {
        const option = document.createElement('option');
        option.value = round;
        option.textContent = round;
        roundSelect.appendChild(option);
    });
    const addRoundOption = document.createElement('option');
    addRoundOption.value = '__ADD_NEW__';
    addRoundOption.textContent = '+ Add new round...';
    roundSelect.appendChild(addRoundOption);

    categorySelect.innerHTML = '<option value="">Select a category...</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    const addCategoryOption = document.createElement('option');
    addCategoryOption.value = '__ADD_NEW__';
    addCategoryOption.textContent = '+ Add new category...';
    categorySelect.appendChild(addCategoryOption);

    if (currentRound && rounds.includes(currentRound)) {
        roundSelect.value = currentRound;
    }
    if (currentCategory && categories.includes(currentCategory)) {
        categorySelect.value = currentCategory;
    }
}

function handleRoundChange() {
    const roundSelect = document.getElementById('round');
    if (roundSelect.value === '__ADD_NEW__') {
        const newRound = prompt('Enter new round name:');
        if (newRound && newRound.trim()) {
            const trimmedRound = newRound.trim();
            if (!rounds.includes(trimmedRound)) {
                rounds.push(trimmedRound);
                saveRounds();
            }
            populateDropdowns();
            roundSelect.value = trimmedRound;
        } else {
            roundSelect.value = '';
        }
    }
}

function handleCategoryChange() {
    const categorySelect = document.getElementById('category');
    if (categorySelect.value === '__ADD_NEW__') {
        const newCategory = prompt('Enter new category name:');
        if (newCategory && newCategory.trim()) {
            const trimmedCategory = newCategory.trim();
            if (!categories.includes(trimmedCategory)) {
                categories.push(trimmedCategory);
                saveCategories();
            }
            populateDropdowns();
            categorySelect.value = trimmedCategory;
        } else {
            categorySelect.value = '';
        }
    }
}

function cancelForm() {
    editingIndex = null;
    clearForm();
    showView('list-view');
}

function saveQuestion() {
    const question = {
        longQuestion: document.getElementById('longQuestion').value.trim(),
        shortQuestion: document.getElementById('shortQuestion').value.trim(),
        answer: document.getElementById('answer').value.trim(),
        category: document.getElementById('category').value.trim(),
        round: document.getElementById('round').value.trim(),
        img: document.getElementById('image').value.trim()
    };

    if (!question.longQuestion && !question.shortQuestion) {
        alert('Please enter at least a long question or short question');
        return;
    }

    if (!question.answer) {
        alert('Please enter an answer');
        return;
    }

    if (!question.round) {
        alert('Please enter a round');
        return;
    }

    if (editingIndex !== null) {
        questions[editingIndex] = question;
    } else {
        questions.push(question);
    }

    saveQuestions();
    renderQuestions();
    cancelForm();
}

function saveAndContinue() {
    const question = {
        longQuestion: document.getElementById('longQuestion').value.trim(),
        shortQuestion: document.getElementById('shortQuestion').value.trim(),
        answer: document.getElementById('answer').value.trim(),
        category: document.getElementById('category').value.trim(),
        round: document.getElementById('round').value.trim(),
        img: document.getElementById('image').value.trim()
    };

    if (!question.longQuestion && !question.shortQuestion) {
        alert('Please enter at least a long question or short question');
        return;
    }

    if (!question.answer) {
        alert('Please enter an answer');
        return;
    }

    if (!question.round) {
        alert('Please enter a round');
        return;
    }

    if (editingIndex !== null) {
        questions[editingIndex] = question;
    } else {
        questions.push(question);
        editingIndex = questions.length - 1;
    }

    saveQuestions();
    renderQuestions();
}

function deleteQuestion() {
    if (editingIndex === null) return;

    if (confirm('Are you sure you want to delete this question?')) {
        questions.splice(editingIndex, 1);
        saveQuestions();
        renderQuestions();
        cancelForm();
    }
}

function showConfigView() {
    if (!currentEvent) {
        alert('Please select or create an event first');
        return;
    }

    showView('config-view');
    renderConfigForm();
}

function renderConfigForm() {
    document.getElementById('configTitle').value = currentEvent;

    const roundsList = document.getElementById('rounds-list');
    roundsList.innerHTML = '';

    rounds.forEach((round, index) => {
        const item = document.createElement('div');
        item.className = 'config-list-item has-specs';
        item.dataset.index = index;
        item.dataset.type = 'round';

        const header = document.createElement('div');
        header.className = 'config-item-header';
        header.draggable = true;
        header.dataset.index = index;
        header.dataset.type = 'round';

        header.innerHTML = `
            <div class="config-item-title">
                <span class="drag-handle">⋮⋮</span>
                <span>${index + 1}. ${round}</span>
            </div>
            <div>
                <button class="delete-item-btn" type="button" title="Delete round">✕</button>
                <button class="expand-button" type="button">▶</button>
            </div>
        `;

        const specsDiv = document.createElement('div');
        specsDiv.className = 'config-item-specs';
        specsDiv.innerHTML = `
            <div class="spec-options">
                <label>
                    <input type="checkbox" id="spec-no-sort-${round}" value="NO_CATEGORY_SORT">
                    Don't sort by category
                </label>
                <label>
                    <input type="checkbox" id="spec-no-questions-${round}" value="NO_QUESTIONS_ONLY">
                    Skip question slides (answers only)
                </label>
                <div class="spec-category-input">
                    <label style="margin: 0;">Extract category:</label>
                    <input type="text" id="spec-category-${round}" placeholder="Category name">
                    <small style="margin: 0;">Extract all questions with this category into this round</small>
                </div>
            </div>
        `;

        header.addEventListener('dragstart', handleDragStart);
        header.addEventListener('dragover', handleDragOver);
        header.addEventListener('drop', handleDrop);
        header.addEventListener('dragend', handleDragEnd);
        header.addEventListener('dragleave', handleDragLeave);

        const deleteBtn = header.querySelector('.delete-item-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete round "${round}"? This will not delete questions, only the round from the configuration.`)) {
                rounds.splice(index, 1);
                saveRounds();
                renderConfigForm();
            }
        });

        const expandButton = header.querySelector('.expand-button');
        expandButton.addEventListener('click', (e) => {
            e.stopPropagation();
            expandButton.classList.toggle('expanded');
            specsDiv.classList.toggle('expanded');
        });

        item.appendChild(header);
        item.appendChild(specsDiv);
        roundsList.appendChild(item);
    });

    const addRoundForm = document.createElement('div');
    addRoundForm.className = 'add-item-form';
    addRoundForm.innerHTML = `
        <input type="text" id="new-round-input" placeholder="Enter new round name">
        <button type="button" class="btn-primary btn-small" onclick="addNewRound()">+ Add Round</button>
    `;
    roundsList.appendChild(addRoundForm);

    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';

    categories.forEach((category, index) => {
        const item = document.createElement('div');
        item.className = 'config-list-item';
        item.draggable = true;
        item.dataset.index = index;
        item.dataset.type = 'category';
        item.innerHTML = `
            <span><span class="drag-handle">⋮⋮</span>${index + 1}. ${category}</span>
            <button class="delete-item-btn" type="button" title="Delete category">✕</button>
        `;

        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragleave', handleDragLeave);

        const deleteBtn = item.querySelector('.delete-item-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete category "${category}"? This will not delete questions, only the category from the configuration.`)) {
                categories.splice(index, 1);
                saveCategories();
                renderConfigForm();
            }
        });

        categoriesList.appendChild(item);
    });

    const addCategoryForm = document.createElement('div');
    addCategoryForm.className = 'add-item-form';
    addCategoryForm.innerHTML = `
        <input type="text" id="new-category-input" placeholder="Enter new category name">
        <button type="button" class="btn-primary btn-small" onclick="addNewCategory()">+ Add Category</button>
    `;
    categoriesList.appendChild(addCategoryForm);

}

let draggedElement = null;
let draggedType = null;
let draggedIndex = null;

function handleDragStart(e) {
    draggedElement = e.currentTarget;
    draggedType = e.currentTarget.dataset.type;
    draggedIndex = parseInt(e.currentTarget.dataset.index);

    if (draggedType === 'round') {
        draggedElement.closest('.config-list-item').classList.add('dragging');
    } else {
        draggedElement.classList.add('dragging');
    }

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    const targetType = e.currentTarget.dataset.type;
    if (draggedType === targetType) {
        if (draggedType === 'round') {
            e.currentTarget.closest('.config-list-item').classList.add('drag-over');
        } else {
            e.currentTarget.classList.add('drag-over');
        }
        e.dataTransfer.dropEffect = 'move';
    }

    return false;
}

function handleDragLeave(e) {
    if (e.currentTarget.dataset.type === 'round') {
        e.currentTarget.closest('.config-list-item').classList.remove('drag-over');
    } else {
        e.currentTarget.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (e.currentTarget.dataset.type === 'round') {
        e.currentTarget.closest('.config-list-item').classList.remove('drag-over');
    } else {
        e.currentTarget.classList.remove('drag-over');
    }

    const targetType = e.currentTarget.dataset.type;
    const targetIndex = parseInt(e.currentTarget.dataset.index);

    if (draggedType === targetType && draggedIndex !== targetIndex) {
        if (draggedType === 'round') {
            const item = rounds.splice(draggedIndex, 1)[0];
            rounds.splice(targetIndex, 0, item);
            saveRounds();
        } else if (draggedType === 'category') {
            const item = categories.splice(draggedIndex, 1)[0];
            categories.splice(targetIndex, 0, item);
            saveCategories();
        }

        renderConfigForm();
    }

    return false;
}

function handleDragEnd(e) {
    if (e.currentTarget.dataset.type === 'round') {
        e.currentTarget.closest('.config-list-item').classList.remove('dragging');
    } else {
        e.currentTarget.classList.remove('dragging');
    }

    document.querySelectorAll('.config-list-item').forEach(item => {
        item.classList.remove('drag-over');
    });

    draggedElement = null;
    draggedType = null;
    draggedIndex = null;
}

function addNewRound() {
    const input = document.getElementById('new-round-input');
    const roundName = input.value.trim();

    if (!roundName) {
        alert('Please enter a round name');
        return;
    }

    if (rounds.includes(roundName)) {
        alert('This round already exists');
        return;
    }

    rounds.push(roundName);
    saveRounds();
    input.value = '';
    renderConfigForm();
}

function addNewCategory() {
    const input = document.getElementById('new-category-input');
    const categoryName = input.value.trim();

    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }

    if (categories.includes(categoryName)) {
        alert('This category already exists');
        return;
    }

    categories.push(categoryName);
    saveCategories();
    input.value = '';
    renderConfigForm();
}

function cancelConfig() {
    showView('list-view');
}

function exportQuizData() {
    if (!currentEvent) {
        alert('Please select an event first');
        return;
    }

    if (questions.length === 0) {
        alert('No questions to export');
        return;
    }

    // Collect specs from the DOM
    const specs = {};
    rounds.forEach(round => {
        const roundSpecs = [];

        const noSort = document.getElementById(`spec-no-sort-${round}`);
        if (noSort && noSort.checked) {
            roundSpecs.push('NO_CATEGORY_SORT');
        }

        const noQuestions = document.getElementById(`spec-no-questions-${round}`);
        if (noQuestions && noQuestions.checked) {
            roundSpecs.push('NO_QUESTIONS_ONLY');
        }

        const categoryInput = document.getElementById(`spec-category-${round}`);
        if (categoryInput && categoryInput.value.trim()) {
            roundSpecs.push(`CATEGORY:${categoryInput.value.trim()}`);
        }

        if (roundSpecs.length > 0) {
            specs[round] = roundSpecs;
        }
    });

    // Create a working copy of questions
    let processedQuestions = JSON.parse(JSON.stringify(questions));

    // Handle CATEGORY extraction specs
    rounds.forEach(round => {
        if (specs[round]) {
            const categorySpec = specs[round].find(spec => spec.startsWith('CATEGORY:'));
            if (categorySpec) {
                const categoryToExtract = categorySpec.substring(9); // Remove "CATEGORY:" prefix

                // Find all questions with this category and add copies to this round
                questions.forEach(q => {
                    if (q.category === categoryToExtract) {
                        const copy = JSON.parse(JSON.stringify(q));
                        copy.round = round;
                        processedQuestions.push(copy);
                    }
                });
            }
        }
    });

    // Group questions by round
    const questionsByRound = {};
    rounds.forEach(round => {
        questionsByRound[round] = [];
    });

    processedQuestions.forEach(q => {
        if (questionsByRound.hasOwnProperty(q.round)) {
            questionsByRound[q.round].push(q);
        }
    });

    // Sort questions within each round by category (unless NO_CATEGORY_SORT)
    rounds.forEach(round => {
        const roundQuestions = questionsByRound[round];

        if (roundQuestions.length > 0) {
            // Check if NO_CATEGORY_SORT is set for this round
            const hasNoSort = specs[round] && specs[round].includes('NO_CATEGORY_SORT');

            if (!hasNoSort) {
                // Sort by category using the category_order
                roundQuestions.sort((a, b) => {
                    const aIndex = categories.indexOf(a.category);
                    const bIndex = categories.indexOf(b.category);

                    // If category not found, put it at the end
                    const aPos = aIndex === -1 ? 9999 : aIndex;
                    const bPos = bIndex === -1 ? 9999 : bIndex;

                    return aPos - bPos;
                });
            }
        }
    });

    // Build the questions array in the format needed by presenter
    const outputQuestions = [];
    rounds.forEach(round => {
        const roundQuestions = questionsByRound[round];

        if (roundQuestions.length > 0) {
            const roundObj = {
                name: round,
                questions: roundQuestions.map(q => ({
                    longQuestion: q.longQuestion || '',
                    shortQuestion: q.shortQuestion || '',
                    answer: q.answer || '',
                    category: q.category || '',
                    img: q.img || '',
                    sound: q.sound || '',
                    round: round
                }))
            };
            outputQuestions.push(roundObj);
        }
    });

    // Build settings object
    const settings = {};
    if (Object.keys(specs).length > 0) {
        settings.specs = specs;
    }

    // Format as JavaScript
    let output = '// Quiz data generated by Question Editor\n';
    output += '// Event: ' + currentEvent + '\n';
    output += '// Generated: ' + new Date().toLocaleString() + '\n\n';
    output += 'var questions = ' + JSON.stringify(outputQuestions, null, 4) + ';\n\n';
    output += 'var settings = ' + JSON.stringify(settings, null, 4) + ';\n';

    // Download the file
    const blob = new Blob([output], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Quiz data exported successfully!\n\nThe file "quiz_data.js" has been downloaded.\n\nNext steps:\n1. Find the file in your Downloads folder\n2. Copy it to the kwismaster_presenter_kit folder\n3. Replace the existing quiz_data.js file\n4. Open presenter.html to view your quiz!');
}

function importQuestions(event) {
    if (!currentEvent) {
        alert('Please select or create an event first');
        event.target.value = '';
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const parsedQuestions = parseQuestionsFile(content);

            if (parsedQuestions.length === 0) {
                alert('No questions found in file');
                return;
            }

            let newRoundsCount = 0;
            let newCategoriesCount = 0;

            parsedQuestions.forEach(q => {
                if (q.round && !rounds.includes(q.round)) {
                    rounds.push(q.round);
                    newRoundsCount++;
                }
                if (q.category && !categories.includes(q.category)) {
                    categories.push(q.category);
                    newCategoriesCount++;
                }
                questions.push(q);
            });

            saveQuestions();
            if (newRoundsCount > 0) saveRounds();
            if (newCategoriesCount > 0) saveCategories();

            renderQuestions();

            alert(`Successfully imported ${parsedQuestions.length} questions!\n` +
                  (newRoundsCount > 0 ? `Added ${newRoundsCount} new rounds.\n` : '') +
                  (newCategoriesCount > 0 ? `Added ${newCategoriesCount} new categories.` : ''));

        } catch (error) {
            console.error('Error parsing file:', error);
            alert('Error parsing file. Please check the file format.');
        }

        event.target.value = '';
    };

    reader.readAsText(file);
}

function parseQuestionsFile(content) {
    const lines = content.split('\n');
    const parsedQuestions = [];
    let currentQuestion = {};
    let currentKey = null;
    let currentValue = '';

    const keyMappings = {
        'long question:': 'longQuestion',
        'short question:': 'shortQuestion',
        'answer:': 'answer',
        'image:': 'image',
        'sound:': 'sound',
        'category:': 'category',
        'round:': 'round'
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '') {
            if (currentKey && currentValue.trim()) {
                currentQuestion[currentKey] = currentValue.trim();
            }

            if (Object.keys(currentQuestion).length > 0) {
                if (currentQuestion.longQuestion || currentQuestion.shortQuestion) {
                    parsedQuestions.push(currentQuestion);
                }
                currentQuestion = {};
            }

            currentKey = null;
            currentValue = '';
            continue;
        }

        const lowerLine = line.toLowerCase();
        let foundKey = false;

        for (const [fileKey, objKey] of Object.entries(keyMappings)) {
            if (lowerLine.startsWith(fileKey)) {
                if (currentKey && currentValue.trim()) {
                    currentQuestion[currentKey] = currentValue.trim();
                }

                currentKey = objKey;
                currentValue = line.substring(fileKey.length).trim();
                foundKey = true;
                break;
            }
        }

        if (!foundKey && currentKey) {
            currentValue += ' ' + line;
        }
    }

    if (currentKey && currentValue.trim()) {
        currentQuestion[currentKey] = currentValue.trim();
    }
    if (Object.keys(currentQuestion).length > 0) {
        if (currentQuestion.longQuestion || currentQuestion.shortQuestion) {
            parsedQuestions.push(currentQuestion);
        }
    }

    return parsedQuestions;
}

function getSortedQuestionIndices() {
    // Create array of {question, originalIndex}
    const indexed = questions.map((q, idx) => ({ question: q, originalIndex: idx }));

    // Sort by round order, then by category order
    indexed.sort((a, b) => {
        const aRoundIndex = rounds.indexOf(a.question.round);
        const bRoundIndex = rounds.indexOf(b.question.round);

        // Compare rounds
        const aRoundPos = aRoundIndex === -1 ? 9999 : aRoundIndex;
        const bRoundPos = bRoundIndex === -1 ? 9999 : bRoundIndex;

        if (aRoundPos !== bRoundPos) {
            return aRoundPos - bRoundPos;
        }

        // Same round, compare categories
        const aCategoryIndex = categories.indexOf(a.question.category);
        const bCategoryIndex = categories.indexOf(b.question.category);

        const aCategoryPos = aCategoryIndex === -1 ? 9999 : aCategoryIndex;
        const bCategoryPos = bCategoryIndex === -1 ? 9999 : bCategoryIndex;

        return aCategoryPos - bCategoryPos;
    });

    return indexed;
}

function updateNavigationButtons() {
    const nav = document.getElementById('question-nav');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const position = document.getElementById('question-position');

    if (editingIndex === null) {
        nav.style.display = 'none';
        return;
    }

    nav.style.display = 'flex';

    // Get sorted order
    const sortedIndices = getSortedQuestionIndices();
    const currentPositionInSorted = sortedIndices.findIndex(item => item.originalIndex === editingIndex);

    // Find current question's round
    const currentQuestion = questions[editingIndex];
    const currentRound = currentQuestion.round;

    // Get all questions in the same round (in sorted order)
    const questionsInRound = sortedIndices.filter(item => item.question.round === currentRound);
    const positionInRound = questionsInRound.findIndex(item => item.originalIndex === editingIndex);

    // Update the title to match current state (position within round)
    const questionNumberInRound = positionInRound + 1;
    const roundName = currentQuestion.round || 'No Round';
    document.getElementById('form-title').textContent = `Edit Question ${questionNumberInRound} [Round ${roundName}]`;

    // Update position display
    position.textContent = `${questionNumberInRound} of ${questionsInRound.length} in ${currentRound}`;

    // Disable/enable buttons based on position in sorted order
    prevBtn.disabled = currentPositionInSorted === 0;
    nextBtn.disabled = currentPositionInSorted === sortedIndices.length - 1;
}

function navigateToPrevious() {
    if (editingIndex === null) return;

    const sortedIndices = getSortedQuestionIndices();
    const currentPos = sortedIndices.findIndex(item => item.originalIndex === editingIndex);

    if (currentPos > 0) {
        const previousIndex = sortedIndices[currentPos - 1].originalIndex;
        editQuestion(previousIndex);
    }
}

function navigateToNext() {
    if (editingIndex === null) return;

    const sortedIndices = getSortedQuestionIndices();
    const currentPos = sortedIndices.findIndex(item => item.originalIndex === editingIndex);

    if (currentPos < sortedIndices.length - 1) {
        const nextIndex = sortedIndices[currentPos + 1].originalIndex;
        editQuestion(nextIndex);
    }
}

loadEvents();
