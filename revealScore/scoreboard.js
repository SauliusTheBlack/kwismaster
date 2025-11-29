async function fetchScores(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch scores:', error);
        throw error;
    }
}

var rounds = [];
const render = new Event("render");

// Play/Pause state - module scope
let isPlaying = false;
let intervalId = null;
let countdownIntervalId = null;
let timeRemaining = 7.5; // seconds

const SLIDE_INTERVAL = 7500; // 7.5 seconds in milliseconds

// Calculate teams per slide based on total team count
// Split into equal groups of 5-9 teams when > 10 teams total
function calculateTeamsPerSlide(totalTeams) {
    if (totalTeams <= 10) {
        return totalTeams; // All teams on one slide
    }

    // Split into equal groups: each slide gets 5-9 teams
    // Formula ensures even distribution with max 9 per slide
    const teamsPerSlide = Math.ceil(totalTeams / Math.ceil(totalTeams / 9));
    console.log(`${totalTeams} teams: ${teamsPerSlide} per slide (${Math.ceil(totalTeams / teamsPerSlide)} slides)`);
    return teamsPerSlide;
}

// Update page counter display
function updatePageCounter() {
    const pageCounterEl = document.getElementById('pageCounter');
    if (!pageCounterEl) return;

    const currentIndices = Reveal.getIndices();
    const totalSlides = Reveal.getTotalSlides();
    const currentSlide = currentIndices.h + 1;

    // Only show counter for score slides (skip configuration and title slides)
    if (currentSlide <= 2) {
        pageCounterEl.textContent = '--';
    } else {
        pageCounterEl.textContent = `Slide ${currentSlide - 2} / ${totalSlides - 2}`;
    }
}

// Update countdown display
function updateCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    countdownEl.textContent = `${timeRemaining.toFixed(1)}s`;
}

document.addEventListener('DOMContentLoaded', primeConfiguration);
document.addEventListener('DOMContentLoaded', renderScores);
document.addEventListener('DOMContentLoaded', function() {
    // Update page counter when slides change
    Reveal.on('slidechanged', updatePageCounter);
    // Initial page counter update
    setTimeout(updatePageCounter, 100);
});

document.addEventListener('render', renderScores);

function primeConfiguration() {

    let table = document.createElement("TABLE");
    let row = document.createElement("TR");
    rounds.forEach((round) => {
        console.log("adding checkbox for " + round);
        let cell = document.createElement("TH")
        cell.innerText = round;
        row.appendChild(cell);


    })

    console.log("adding checkbox for total ");
    let cell = document.createElement("TH")
    cell.innerText = "Total";
    row.appendChild(cell);

    table.appendChild(row);

    row = document.createElement("TR");

    rounds.forEach((round) => {
        console.log("adding checkbox for " + round);
        let checkbox = document.createElement("INPUT");
        let label = document.createElement("LABEL");
        let checkboxId = "checkbox_" + round.replace(" ", "_");

        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", checkboxId);
        label.setAttribute("for", checkboxId);
        label.appendChild(checkbox);

        let cell = document.createElement("TD");
        cell.appendChild(label);
        row.appendChild(cell);
    })

    console.log("adding checkbox for total ");
    cell = document.createElement("TD");

    checkbox = document.createElement("INPUT");
    let label = document.createElement("LABEL");

    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", "checkbox_total");
    label.setAttribute("for", "checkbox_total");
    label.appendChild(checkbox);

    cell.appendChild(label);
    row.appendChild(cell);


    table.appendChild(row);

    document.getElementById('configuration').appendChild(table);

    console.log("Priming configuration");
    console.log(document.getElementById("configButton"));
    document.getElementById("configButton").addEventListener("click", () => {
        console.log("I was clicked")
        renderScores();
    });

}

async function renderScores() {
    console.log("rendering scores");

    // Stop auto-advance if playing (since we're regenerating slides)
    if (isPlaying && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        isPlaying = false;
        stopCountdown();
        const playButton = document.getElementById('playControl');
        if (playButton) {
            playButton.textContent = 'Play';
        }
    }

    var scores;
    try {
        scores = await fetchScores("http://localhost:4040/scores");
        console.log(scores);
    } catch (error) {
        // Show error slide
        const errorSection = document.createElement('section');
        errorSection.innerHTML = `
            <h2>Connection Error</h2>
            <p>Cannot connect to scorekeeper at http://localhost:4040/scores</p>
            <p>Please check that the scorekeeper is running.</p>
        `;
        var totalSlides = Reveal.getTotalSlides();
        if (totalSlides > 2) {
            document.querySelectorAll('.reveal .slides section:nth-child(n+3)').forEach(slide => slide.remove());
        }
        slides.appendChild(errorSection);
        return;
    }

    // Check for empty scores
    if (!scores || Object.keys(scores).length === 0) {
        const emptySection = document.createElement('section');
        emptySection.innerHTML = `
            <h2>No scores yet</h2>
            <p>Scores will appear here once teams are registered.</p>
        `;
        var totalSlides = Reveal.getTotalSlides();
        if (totalSlides > 2) {
            document.querySelectorAll('.reveal .slides section:nth-child(n+3)').forEach(slide => slide.remove());
        }
        slides.appendChild(emptySection);
        return;
    }

    const sortedScoresArray = Object.entries(scores).sort((a, b) => {
        if (b[1].total === a[1].total) {
            return a[0].localeCompare(b[0]); // Alphabetical on ties
        }
        return b[1].total - a[1].total; // Sort by the 'total' key in descending order
    });

    // Convert the sorted array back into an object
    const sortedScores = Object.fromEntries(sortedScoresArray);

    // Output the sorted object
    console.log(sortedScores);

    // Calculate teams per slide based on total team count
    const totalTeams = sortedScoresArray.length;
    const teamsPerSlide = calculateTeamsPerSlide(totalTeams);

    var currentResultsShown = 0;

    function cellWithValue(value) {
        const cell = document.createElement('td');
        cell.textContent = value;

        return cell;
    }

    var scoreTable;
    var scoreBody;

    // slides.replaceChildren();
    var totalSlides = Reveal.getTotalSlides();
    console.log(totalSlides);
    if (totalSlides > 2) {
        document.querySelectorAll('.reveal .slides section:nth-child(n+3)').forEach(slide => slide.remove());
    }

    sortedScoresArray.forEach(([team, score]) => {

        if (currentResultsShown == 0) {
            scoreBody = document.createElement('section');
            scoreTable = document.createElement("table");

            const row = document.createElement('tr');

            row.appendChild(cellWithValue(" "));

            rounds.forEach((round) => {
                console.log(document.getElementById("checkbox_" + round.replace(" ", "_")).checked);
                if (document.getElementById("checkbox_" + round.replace(" ", "_")).checked) {
                    console.log("Adding header for " + round)
                    row.appendChild(cellWithValue(round));
                }
            })

            row.appendChild(cellWithValue("Totaal"));
            scoreTable.appendChild(row);

        }
        currentResultsShown++;

        const row = document.createElement('tr');

        // Create and append team name

        row.appendChild(cellWithValue(team));
        rounds.forEach((round) => {
            console.log(document.getElementById("checkbox_" + round.replace(" ", "_")).checked);
            if (document.getElementById("checkbox_" + round.replace(" ", "_")).checked) {
                console.log("Adding score for " + round)
                row.appendChild(cellWithValue(score[round]));
            }
        })
        row.appendChild(cellWithValue(score['total']));

        // Append the row to the tbody
        scoreTable.appendChild(row);

        if (currentResultsShown >= teamsPerSlide) {
            // Append tbody to the table
            scoreBody.appendChild(scoreTable);
            currentResultsShown = 0
            slides.appendChild(scoreBody)
        }

    });

    scoreBody.appendChild(scoreTable);
    currentResultsShown = 0
    slides.appendChild(scoreBody)
}

// Start countdown timer
function startCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        countdownEl.classList.add('active');
    }

    timeRemaining = SLIDE_INTERVAL / 1000; // Reset to full time
    updateCountdown();

    // Update countdown every 100ms for smooth display
    countdownIntervalId = setInterval(function() {
        timeRemaining -= 0.1;
        if (timeRemaining < 0) {
            timeRemaining = SLIDE_INTERVAL / 1000; // Reset for next slide
        }
        updateCountdown();
    }, 100);
}

// Stop countdown timer
function stopCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        countdownEl.classList.remove('active');
    }

    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }
}

// Initialize play/pause button - runs once on page load
function initPlayPauseButton() {
    const playButton = document.getElementById('playControl');
    if (!playButton) {
        console.error('Play button not found');
        return;
    }

    playButton.addEventListener('click', function() {
        if (isPlaying) {
            // Pause
            isPlaying = false;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            stopCountdown();
            Reveal.configure({ loop: false });
            this.textContent = 'Play';
        } else {
            // Play
            isPlaying = true;
            Reveal.configure({ loop: true });

            startCountdown();

            intervalId = setInterval(function() {
                const totalSlides = Reveal.getTotalSlides();
                const currentIndices = Reveal.getIndices();
                const isLastSlide = currentIndices.h === (totalSlides - 1);

                if (isLastSlide) {
                    Reveal.slide(2); // Jump back to first score slide
                } else {
                    Reveal.next();
                }
                // Reset countdown when slide changes
                timeRemaining = SLIDE_INTERVAL / 1000;
            }, SLIDE_INTERVAL);

            Reveal.slide(2); // Start at first score slide
            this.textContent = 'Pause';
        }
    });
}

// Run once when page loads
document.addEventListener('DOMContentLoaded', initPlayPauseButton);