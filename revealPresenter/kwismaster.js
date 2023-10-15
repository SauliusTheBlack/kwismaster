function makeQuestionSlides(roundObj, questionObj) {

    var roundTitleDOM = document.createElement('section');
    roundTitleDOM.innerHTML = roundObj["name"];

    if (Object.keys(settings.specs).includes(roundObj["name"])) {
        console.log("found a setting for " + roundObj["name"]);
        if (settings.specs[roundObj["name"]].includes("NO_QUESTIONS_ONLY")) {
            console.log("Skipping questions slides for this round")
            return;
        }

    } else {
        console.log("found no setting for " + roundObj["name"]);
    }

    slides.appendChild(roundTitleDOM);
    for (question in questionObj) {
        var imgRatio = 1;
        var questionDOM = document.createElement('section');

        var questionTitle = document.createElement('h4');
        var questionCategory = document.createElement('h5');
        var questionCounter = Number(question) + 1;
        questionTitle.innerHTML = roundObj["name"] + " - " + "Vraag " + questionCounter;
        if ("category" in questionObj[question]) {
            questionCategory.innerHTML = questionObj[question]["category"];
        }

        var questionBody = document.createElement('section');

        var questionBodyQuestion = document.createElement('div');
        questionBodyQuestion.innerHTML = questionObj[question]["shortQuestion"];



        var questionBodyLongQuestion = document.createElement('aside');
        questionBodyLongQuestion.className = "notes";
        questionBodyLongQuestion.innerHTML = questionObj[question]["longQuestion"];

        questionBody.appendChild(questionBodyQuestion);
        questionBody.appendChild(questionBodyLongQuestion);


        questionDOM.appendChild(questionTitle);
        questionDOM.appendChild(questionCategory);
        questionDOM.appendChild(questionBody);

        if (questionObj[question]["img"]) {
            console.log("restyling");
            var questionImg = document.createElement('img');
            questionImg.src = "images/" + questionObj[question]["img"].split(":")[0];
            imgRatio = questionObj[question]["img"].split(":")[1] || 1;
            questionImg.style.height = (300 * imgRatio) + 'px';
            questionBody.appendChild(questionImg);
        }


        slides.appendChild(questionDOM);
    }
}

function makeAnswerSlides(roundObj, questionObj, excludeQuestions = []) {
    var roundTitleDOM = document.createElement('section');
    roundTitleDOM.innerHTML = roundObj["name"] + " - Antwoorden";

    slides.appendChild(roundTitleDOM);
    for (question in questionObj) {
        var imgRatio = 1;
        if (excludeQuestions.includes(questionObj[question]["category"])) {
            continue;
        }
        var questionDOM = document.createElement('section');

        var questionTitle = document.createElement('div');
        var questionCategory = document.createElement('div');
        var questionCounter = Number(question) + 1;
        questionTitle.innerHTML = roundObj["name"] + " - " + "Vraag " + questionCounter;
        if ("category" in questionObj[question]) {
            questionCategory.innerHTML = questionObj[question]["category"];
        }

        var questionBody = document.createElement('section');
        var questionBodyQuestion = document.createElement('div');
        var questionBodyAnswer = document.createElement('div');

        questionBodyQuestion.innerHTML = questionObj[question]["shortQuestion"];
        if (questionObj[question]["answer"] !== "") {
            questionBodyAnswer.innerHTML = "[" + questionObj[question]["answer"] + "]";
        }
        questionBody.appendChild(questionBodyQuestion);
        if (questionObj[question]["img"]) {
            var questionImg = document.createElement('img');
            questionImg.src = "images/" + questionObj[question]["img"].split(":")[0];
            imgRatio = questionObj[question]["img"].split(":")[1] || 1;
            questionImg.style.height = (300 * imgRatio) + 'px';
            questionBody.appendChild(questionImg);
        }
        questionBody.appendChild(questionBodyAnswer);

        questionDOM.appendChild(questionTitle);
        questionDOM.appendChild(questionCategory);
        questionDOM.appendChild(questionBody);

        slides.appendChild(questionDOM);
    }
}

function domQuestions() {

    for (var round in questions) {
        var roundObj = questions[round];
        var pat = /CATEGORY:/g;
        // if (Object.keys(settings.specs).includes(roundObj["name"])) {
        //     console.log(settings.specs[roundObj["name"]].some(e => pat.test(e)));
        //     console.log("Need to extract category from all questions")
        // } else {
        var questionObj = roundObj["questions"];

        makeQuestionSlides(roundObj, questionObj);
        //hardcoded for traddans, needs to change
        if (roundObj["name"] === "Rode Draad") {
            makeAnswerSlides(roundObj, questionObj);
        } else {
            makeAnswerSlides(roundObj, questionObj, ["Rode Draad"]);
        }
    }
}

window.addEventListener("load", (event) => {
    domQuestions();
});