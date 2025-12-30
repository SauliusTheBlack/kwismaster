<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <title>Score Presentatie</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: radial-gradient(circle, #f7f3de, #e8ddb5);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }

        .slide-container {
            width: 90%;
            max-width: 1400px;
            margin: 0 auto;
        }

        .slide {
            display: none;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        }

        .slide.active {
            display: block;
            opacity: 1;
        }

        h1 {
            text-align: center;
            margin-bottom: 2em;
            color: #8b743d;
            font-size: 3em;
        }

        table {
            width: 90%;
            max-width: 1400px;
            margin: 0 auto;
            border-collapse: collapse;
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-size: 1.8em;
        }

        th, td {
            padding: 0.8em;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }

        th {
            background-color: #8b743d;
            color: white;
            font-weight: bold;
        }

        td:first-child, th:first-child {
            text-align: left;
            padding-left: 1.5em;
            white-space: nowrap;
        }

        td:last-child, th:last-child {
            font-weight: bold;
            border-left: 3px solid #8b743d;
        }

        tr:hover {
            background-color: rgba(139, 116, 61, 0.1);
        }

        tr:nth-child(even) {
            background-color: rgba(0, 0, 0, 0.02);
        }

        /* Controls */
        #controls {
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 15px;
            z-index: 1000;
        }

        #pageCounter, #countdown {
            background-color: #f7f3de;
            color: #333;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            border: 3px solid #8b743d;
            min-width: 150px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        #countdown {
            display: none;
        }

        #countdown.active {
            display: block;
        }

        button {
            padding: 15px 35px;
            font-size: 20px;
            border: 3px solid #8b743d;
            background-color: #f7f3de;
            color: #333;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            font-weight: bold;
        }

        button:hover {
            background-color: #8b743d;
            color: #fff;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .error-message, .empty-message {
            text-align: center;
            padding: 3em;
            font-size: 2em;
        }

        .error-message h2, .empty-message h2 {
            color: #8b743d;
            margin-bottom: 0.5em;
        }

        @media (max-width: 1600px) {
            table { font-size: 1.6em; }
        }

        @media (max-width: 1200px) {
            table { font-size: 1.4em; }
        }

        @media (max-width: 900px) {
            table { font-size: 1.2em; }
        }
    </style>
</head>
<body>
    <div class="slide-container" id="slideContainer">
        <!-- Configuration screen -->
        <div class="slide active" id="configSlide">
            <h1>Selecteer Rondes</h1>
            <div style="text-align: center;">
                <table id="configTable" style="display: inline-block; margin: 2em auto;">
                    <thead>
                        <tr id="configHeader"></tr>
                    </thead>
                    <tbody>
                        <tr id="configCheckboxes"></tr>
                    </tbody>
                </table>
                <br><br>
                <button id="configButton" style="font-size: 1.5em; padding: 20px 40px;">Bevestigen</button>
            </div>
        </div>
    </div>

    <div id="controls">
        <div id="pageCounter">--</div>
        <div id="countdown">7.5s</div>
        <button id="playControl">Play</button>
    </div>

    <script>
        const rounds = {{!rounds}};
        let isPlaying = false;
        let intervalId = null;
        let countdownIntervalId = null;
        let timeRemaining = 7.5;
        const SLIDE_INTERVAL = 7500;
        let currentSlideIndex = 0;
        let slides = [];
        let selectedRounds = {}; // Track which rounds are selected

        // Populate configuration screen
        function populateConfiguration() {
            const headerRow = document.getElementById('configHeader');
            const checkboxRow = document.getElementById('configCheckboxes');

            // Add headers and checkboxes for each round
            rounds.forEach(round => {
                const roundName = round[0];
                const roundTechnical = round[1];

                // Header cell
                const th = document.createElement('th');
                th.textContent = roundName;
                th.style.padding = '1em';
                headerRow.appendChild(th);

                // Checkbox cell
                const td = document.createElement('td');
                td.style.padding = '1em';
                td.style.cursor = 'pointer';

                const label = document.createElement('label');
                label.style.cursor = 'pointer';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = 'checkbox_' + roundTechnical;
                checkbox.style.width = '24px';
                checkbox.style.height = '24px';
                checkbox.style.cursor = 'pointer';

                label.appendChild(checkbox);
                td.appendChild(label);
                checkboxRow.appendChild(td);

                // Initialize selection state
                selectedRounds[roundTechnical] = false;

                // Update selection on change
                checkbox.addEventListener('change', () => {
                    selectedRounds[roundTechnical] = checkbox.checked;
                });
            });

            // Add "Total" column
            const thTotal = document.createElement('th');
            thTotal.textContent = 'Totaal';
            thTotal.style.padding = '1em';
            headerRow.appendChild(thTotal);

            const tdTotal = document.createElement('td');
            tdTotal.style.padding = '1em';
            tdTotal.style.cursor = 'pointer';

            const labelTotal = document.createElement('label');
            labelTotal.style.cursor = 'pointer';

            const checkboxTotal = document.createElement('input');
            checkboxTotal.type = 'checkbox';
            checkboxTotal.id = 'checkbox_total';
            checkboxTotal.style.width = '24px';
            checkboxTotal.style.height = '24px';
            checkboxTotal.style.cursor = 'pointer';

            labelTotal.appendChild(checkboxTotal);
            tdTotal.appendChild(labelTotal);
            checkboxRow.appendChild(tdTotal);

            selectedRounds['total'] = false;
            checkboxTotal.addEventListener('change', () => {
                selectedRounds['total'] = checkboxTotal.checked;
            });
        }

        // Fetch scores from API
        async function fetchScores() {
            try {
                const response = await fetch('http://localhost:4040/scores');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Failed to fetch scores:', error);
                throw error;
            }
        }

        // Calculate teams per slide (5-9 teams)
        function calculateTeamsPerSlide(totalTeams) {
            if (totalTeams <= 10) {
                return totalTeams;
            }
            const teamsPerSlide = Math.ceil(totalTeams / Math.ceil(totalTeams / 9));
            console.log(`${totalTeams} teams: ${teamsPerSlide} per slide`);
            return teamsPerSlide;
        }

        // Render scores into slides
        async function renderScores() {
            // Hide config slide
            document.getElementById('configSlide').style.display = 'none';

            const container = document.getElementById('slideContainer');
            // Clear only score slides, keep config slide
            const scoreSlides = container.querySelectorAll('.slide:not(#configSlide)');
            scoreSlides.forEach(slide => slide.remove());
            slides = [];

            let scores;
            try {
                scores = await fetchScores();
            } catch (error) {
                container.innerHTML = `
                    <div class="error-message">
                        <h2>Verbindingsfout</h2>
                        <p>Kan geen verbinding maken met de scorekeeper op http://localhost:4040/scores</p>
                        <p>Controleer of de scorekeeper actief is.</p>
                    </div>
                `;
                return;
            }

            if (!scores || Object.keys(scores).length === 0) {
                container.innerHTML = `
                    <div class="empty-message">
                        <h2>Nog geen scores</h2>
                        <p>Scores verschijnen hier zodra teams zijn geregistreerd.</p>
                    </div>
                `;
                return;
            }

            // Sort teams by total score
            const sortedScoresArray = Object.entries(scores).sort((a, b) => {
                if (b[1].total === a[1].total) {
                    return a[0].localeCompare(b[0]);
                }
                return b[1].total - a[1].total;
            });

            const totalTeams = sortedScoresArray.length;
            const teamsPerSlide = calculateTeamsPerSlide(totalTeams);

            // Create slides
            for (let i = 0; i < sortedScoresArray.length; i += teamsPerSlide) {
                const slideTeams = sortedScoresArray.slice(i, i + teamsPerSlide);
                const slideDiv = document.createElement('div');
                slideDiv.className = 'slide';

                // Build table header with selected rounds
                let headerHTML = '<th>Team</th>';
                rounds.forEach(round => {
                    if (selectedRounds[round[1]]) {
                        headerHTML += `<th>${round[0]}</th>`;
                    }
                });
                if (selectedRounds['total']) {
                    headerHTML += '<th>Totaal</th>';
                }

                let tableHTML = `
                    <h1>Scorebord</h1>
                    <table>
                        <thead>
                            <tr>${headerHTML}</tr>
                        </thead>
                        <tbody>
                `;

                // Build rows with selected round scores
                slideTeams.forEach(([teamName, teamScores]) => {
                    let rowHTML = `<td>${teamName}</td>`;
                    rounds.forEach(round => {
                        if (selectedRounds[round[1]]) {
                            const score = teamScores[round[1]] || '-';
                            rowHTML += `<td>${score}</td>`;
                        }
                    });
                    if (selectedRounds['total']) {
                        rowHTML += `<td>${teamScores.total}</td>`;
                    }

                    tableHTML += `<tr>${rowHTML}</tr>`;
                });

                tableHTML += `
                        </tbody>
                    </table>
                `;

                slideDiv.innerHTML = tableHTML;
                container.appendChild(slideDiv);
                slides.push(slideDiv);
            }

            // Show first slide
            if (slides.length > 0) {
                showSlide(0);
            }

            updatePageCounter();
        }

        // Show specific slide
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
            });

            if (slides[index]) {
                slides[index].classList.add('active');
                currentSlideIndex = index;
            }

            updatePageCounter();
        }

        // Next slide
        function nextSlide() {
            if (slides.length === 0) return;

            let nextIndex = currentSlideIndex + 1;
            if (nextIndex >= slides.length) {
                nextIndex = 0; // Loop back to first slide
            }
            showSlide(nextIndex);
            timeRemaining = SLIDE_INTERVAL / 1000; // Reset countdown
        }

        // Update page counter
        function updatePageCounter() {
            const pageCounterEl = document.getElementById('pageCounter');
            if (slides.length === 0) {
                pageCounterEl.textContent = '--';
            } else {
                pageCounterEl.textContent = `Slide ${currentSlideIndex + 1} / ${slides.length}`;
            }
        }

        // Update countdown
        function updateCountdown() {
            const countdownEl = document.getElementById('countdown');
            countdownEl.textContent = `${timeRemaining.toFixed(1)}s`;
        }

        // Start countdown timer
        function startCountdown() {
            const countdownEl = document.getElementById('countdown');
            countdownEl.classList.add('active');

            timeRemaining = SLIDE_INTERVAL / 1000;
            updateCountdown();

            countdownIntervalId = setInterval(() => {
                timeRemaining -= 0.1;
                if (timeRemaining < 0) {
                    timeRemaining = SLIDE_INTERVAL / 1000;
                }
                updateCountdown();
            }, 100);
        }

        // Stop countdown timer
        function stopCountdown() {
            const countdownEl = document.getElementById('countdown');
            countdownEl.classList.remove('active');

            if (countdownIntervalId) {
                clearInterval(countdownIntervalId);
                countdownIntervalId = null;
            }
        }

        // Play/Pause button
        document.getElementById('playControl').addEventListener('click', function() {
            if (isPlaying) {
                // Pause
                isPlaying = false;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                stopCountdown();
                this.textContent = 'Play';
            } else {
                // Play
                if (slides.length === 0) return;

                isPlaying = true;
                startCountdown();

                intervalId = setInterval(() => {
                    nextSlide();
                }, SLIDE_INTERVAL);

                this.textContent = 'Pause';
            }
        });

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', () => {
            // Populate configuration screen
            populateConfiguration();

            // Handle config button click
            document.getElementById('configButton').addEventListener('click', () => {
                renderScores();
            });

            // Refresh scores every 30 seconds
            setInterval(() => {
                if (!isPlaying) {
                    renderScores();
                }
            }, 30000);
        });
    </script>
</body>
</html>
