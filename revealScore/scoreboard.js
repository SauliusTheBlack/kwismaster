function fetchScores(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}

var rounds = [];
const render = new Event("render");

document.addEventListener('DOMContentLoaded', primeConfiguration);
document.addEventListener('DOMContentLoaded', renderScores);

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

        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", "checkbox_" + round.replace(" ", "_"));
        let cell = document.createElement("TD")
        cell.appendChild(checkbox);
        row.appendChild(cell);

    })

    console.log("adding checkbox for total ");
    cell = document.createElement("TD")

    checkbox = document.createElement("INPUT");

    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", "checkbox_total");

    cell.appendChild(checkbox);
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

function renderScores() {
    console.log("rendering scores");

    var scores = fetchScores("http://localhost:4040/scores");
    console.log(scores);

    const sortedScoresArray = Object.entries(scores).sort((a, b) => {
        return b[1].total - a[1].total; // Sort by the 'total' key in descending order
    });

    // Convert the sorted array back into an object
    const sortedScores = Object.fromEntries(sortedScoresArray);

    // Output the sorted object
    console.log(sortedScores);

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

        if (currentResultsShown == 11) {
            // Append tbody to the table
            scoreBody.appendChild(scoreTable);
            currentResultsShown = 0
            slides.appendChild(scoreBody)
        }

    });

    scoreBody.appendChild(scoreTable);
    currentResultsShown = 0
    slides.appendChild(scoreBody)


    let isPlaying = false;
    console.log("Getting element by id")
    console.log(document.getElementById('playControl'))

    document.getElementById('playControl').addEventListener('click', function() {
        console.log("click");
        if (isPlaying) {
            isPlaying = false;
            Reveal.configure({ loop: false }); // Stop looping
            clearInterval(intervalId);
            this.textContent = 'Play';
        } else {
            isPlaying = true;
            Reveal.configure({ loop: true }); // Enable looping

            intervalId = setInterval(function() {

                var currentIndices = Reveal.getIndices();

                var isLastSlide = currentIndices.h === (totalSlides - 1);
                if (isLastSlide) {
                    Reveal.slide(2)
                } else {
                    Reveal.next();
                }
            }, 7500); // Adjust interval as needed

            Reveal.slide(2)
            this.textContent = 'Pause';
        }
    })
}