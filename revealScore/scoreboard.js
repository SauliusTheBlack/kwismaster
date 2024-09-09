function fetchScores(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}



document.addEventListener('DOMContentLoaded', function() {
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

    slides.replaceChildren();
    sortedScoresArray.forEach(([team, score]) => {

        if (currentResultsShown == 0) {
            scoreBody = document.createElement('section');
            scoreTable = document.createElement("table");

            const row = document.createElement('tr');

            row.appendChild(cellWithValue(" "));
            row.appendChild(cellWithValue('Ronde 1'));
            row.appendChild(cellWithValue('Ronde 2'));
            row.appendChild(cellWithValue('Totaal'));

            scoreTable.appendChild(row);

        }
        currentResultsShown++;

        const row = document.createElement('tr');

        // Create and append team name

        row.appendChild(cellWithValue(team));
        row.appendChild(cellWithValue(score['Ronde 1']));
        row.appendChild(cellWithValue(score['Ronde 2']));
        row.appendChild(cellWithValue(score['total']));

        // Append the row to the tbody
        scoreTable.appendChild(row);

        if (currentResultsShown == 10) {
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
                Reveal.next(); // Move to the next slide every second
            }, 5000); // Adjust interval as needed

            Reveal.slide(0)
            this.textContent = 'Pause';
        }
    })
});