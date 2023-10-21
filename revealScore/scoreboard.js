function sumArray(myArray) {
    return myArray.reduce((acc, curr) => {
        return acc + parseInt(curr)
    }, 0);
}

const maxLinesOnSlide = 10;
const lastXScoresToShow = 4;

let parsedScores = [];

function renderScores() {
    console.log(parsedScores);
    var scoreSection = undefined;
    var questionTable = undefined;

    parsedScores.slice(1).forEach((element, index) => {
        console.log(index % maxLinesOnSlide);
        if (index % maxLinesOnSlide == 0) {
            //close previous section
            if (index > 0) {
                scoreSection.appendChild(questionTable);
                slides.appendChild(scoreSection);
            }

            //open new section
            scoreSection = document.createElement('section');
            questionTable = document.createElement('table');
            var headerRow = document.createElement('tr');
            const teamNameCell = document.createElement('th');
            teamNameCell.appendChild(document.createTextNode("Team"));
            headerRow.appendChild(teamNameCell);
            parsedScores[0].scores.slice(Math.max(parsedScores[0].scores.length - lastXScoresToShow, 0)).forEach((rondeNaam, index) => {
                const rondeCell = document.createElement('th');
                rondeCell.appendChild(document.createTextNode(rondeNaam));
                headerRow.appendChild(rondeCell);
            });
            const totalCell = document.createElement('th');
            totalCell.appendChild(document.createTextNode("Totaal"));
            const rank = document.createElement('th');
            rank.appendChild(document.createTextNode("Rang"));
            headerRow.appendChild(totalCell);
            headerRow.appendChild(rank);

            questionTable.appendChild(headerRow);
        }
        var scoreRow = document.createElement('tr');
        const teamNameCell = scoreRow.insertCell();
        teamNameCell.appendChild(document.createTextNode(element.teamName));

        element.scores.slice(Math.max(element.scores.length - lastXScoresToShow, 0)).forEach((scorePoint, index) => {
            const scoreCell = scoreRow.insertCell();
            scoreCell.appendChild(document.createTextNode(scorePoint));
        })

        const teamTotalsCell = scoreRow.insertCell();
        teamTotalsCell.appendChild(document.createTextNode(sumArray(element.scores)));

        questionTable.appendChild(scoreRow);


    })
    scoreSection.appendChild(questionTable);
    slides.appendChild(scoreSection);

}


function parseScoreline(line, lineIndex) {
    console.log(line);
    console.log(line.split("\t"));
    let teamScores = line.split("\t").slice(1);
    let teamName = line.split("\t")[0];
    // console.log(lineIndex + ": " + teamName + " scores: [" + teamScores + "] - total " + sumArray(teamScores));
    parsedScores.push({ teamName: teamName, scores: teamScores })
}

window.onload = (event) => {
    var scoreLines = scores.split("\n");
    scoreLines.forEach((element, index) => {
        if (element) {
            parseScoreline(element, index)
        }
    });

    renderScores();
}