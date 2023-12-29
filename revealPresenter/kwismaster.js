function _setSettings(settingsObj) {
    settings = settingsObj;
}

//feature request: create a setting to exclude specific round from questions, instead of passing it as an argument hardcoded here
function makeAnswerSlides(roundObj, questionObj, excludeQuestions = []) {

    slides.appendChild(makeRoundTitleSlide(roundObj, " - Antwoorden"));
    for (questionIndex in questionObj) {
        if (excludeQuestions.includes(questionObj[questionIndex]["category"])) {
            continue;
        }
        slides.appendChild(makeSingleAnswerSlide(roundObj["name"], questionObj[questionIndex], questionIndex));
    }
}

function makeQuestionSlides(roundObj, questionObj) {
    if (settings && settings.specs && Object.keys(settings.specs).includes(roundObj["name"])) {
        if (settings.specs[roundObj["name"]].includes("NO_QUESTIONS_ONLY")) {
            return;
        }
    } else {
        console.log("found no setting for " + roundObj["name"]);
    }

    slides.appendChild(makeRoundTitleSlide(roundObj));

    for (questionIndex in questionObj) {
        slides.appendChild(makeSingleQuestionSlide(roundObj["name"], questionObj[questionIndex], questionIndex));
    }
}

function setSlideHeader(questionSectionDom, roundName, questionObj, questionIndex) {
    var questionTitle = document.createElement('h4');
    questionTitle.classList.add("questionTitle");
    var questionCategory = document.createElement('h5');
    questionCategory.classList.add("questionCategory");
    var questionCounter = questionIndex;
    questionTitle.innerHTML = roundName + " - " + "Vraag " + questionCounter;
    if ("category" in questionObj) {
        questionCategory.innerHTML = questionObj["category"];
    }

    questionSectionDom.appendChild(questionTitle);
    questionSectionDom.appendChild(questionCategory);
}

function makeSingleAnswerSlide(roundName, questionObj, questionIndex) {
    var imgRatio = 1;
    var questionDOM = document.createElement('section');

    setSlideHeader(questionDOM, roundName, questionObj, questionIndex);


    var questionBody = document.createElement('section');
    var questionBodyQuestion = document.createElement('div');
    var questionBodyAnswer = document.createElement('div');

    questionBodyQuestion.innerHTML = questionObj["shortQuestion"].replace("\\n", "<br/>");
    questionBodyQuestion.classList.add("presentedQuestion");
    if (questionObj["answer"] !== "") {
        questionBodyAnswer.innerHTML = "[" + questionObj["answer"].replace("\\n", "<br/>") + "]";
        questionBodyAnswer.classList.add("answer");
    }

    var questionBodyLongQuestion = document.createElement('aside');
    questionBodyLongQuestion.className = "notes";
    questionBodyLongQuestion.innerHTML = questionObj["longQuestion"].replace("\\n", "<br/>");
    questionBodyLongQuestion.classList.add("notesQuestion");

    questionBody.appendChild(questionBodyQuestion);
    questionBody.appendChild(questionBodyLongQuestion);
    if (questionObj["img"]) {
        var questionImg = document.createElement('img');
        questionImg.src = "images/" + questionObj["img"].split(":")[0];
        imgRatio = questionObj["img"].split(":")[1] || 1;
        questionImg.style.height = (300 * imgRatio) + 'px';
        questionBody.appendChild(questionImg);
    }
    questionBody.appendChild(questionBodyAnswer);


    questionDOM.appendChild(questionBody);

    return questionDOM;
}

function makeSingleQuestionSlide(roundName, questionObj, questionIndex) {
    let questionCounter = Number(questionIndex) + 1;

    var imgRatio = 1;
    var questionDOM = document.createElement('section');

    setSlideHeader(questionDOM, roundName, questionObj, questionCounter);

    var questionBody = document.createElement('p');

    var questionBodyQuestion = document.createElement('div');
    questionBodyQuestion.classList.add("presentedQuestion");
    questionBodyQuestion.innerHTML = questionObj["shortQuestion"].replace("\\n", "<br/>");

    var questionBodyLongQuestion = document.createElement('aside');
    questionBodyLongQuestion.className = "notes";
    questionBodyLongQuestion.innerHTML = questionObj["longQuestion"].replace("\\n", "<br/>");
    questionBodyLongQuestion.classList.add("notesQuestion");

    questionBody.appendChild(questionBodyQuestion);
    questionBody.appendChild(questionBodyLongQuestion);

    if (questionObj["img"]) {
        console.log("restyling");
        var questionImg = document.createElement('img');
        questionImg.src = "images/" + questionObj["img"].split(":")[0];
        imgRatio = questionObj["img"].split(":")[1] || 1;
        questionImg.style.height = (300 * imgRatio) + 'px';
        questionBody.appendChild(questionImg);
    }

    questionDOM.appendChild(questionBody);

    return questionDOM;
}

function makeRoundTitleSlide(roundObj, suffix) {
    var roundTitleDOM = document.createElement('section');
    if (suffix === undefined) {
        suffix = "";
    }
    roundTitleDOM.innerHTML = roundObj["name"] + suffix;
    return roundTitleDOM;
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