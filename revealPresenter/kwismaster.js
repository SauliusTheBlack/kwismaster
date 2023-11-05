function _setSettings(settingsObj) {
    settings = settingsObj;
}

//feature request: create a setting to exclude specific round from questions, instead of passing it as an argument hardcoded here
function makeAnswerSlides(roundObj, questionObj, excludeQuestions = []) {

    slides.appendChild(makeRoundTitleSlide(roundObj, " - Antwoorden"));
    for (question in questionObj) {
        if (excludeQuestions.includes(questionObj[question]["category"])) {
            continue;
        }
        slides.appendChild(makeSingleAnswerSlide(roundObj, questionObj));
    }
}

function makeQuestionSlides(roundObj, questionObj) {
    if (Object.keys(settings.specs).includes(roundObj["name"])) {
        if (settings.specs[roundObj["name"]].includes("NO_QUESTIONS_ONLY")) {
            return;
        }
    } else {
        console.log("found no setting for " + roundObj["name"]);
    }

    slides.appendChild(makeRoundTitleSlide(roundObj));

    for (question in questionObj) {
        slides.appendChild(makeSingleQuestionSlide(roundObj, questionObj));
    }
}

function setSlideHeader(questionSectionDom, question, roundObj, questionObj) {
    var questionTitle = document.createElement('h4');
    var questionCategory = document.createElement('h5');
    var questionCounter = Number(question) + 1;
    questionTitle.innerHTML = roundObj["name"] + " - " + "Vraag " + questionCounter;
    if ("category" in questionObj[question]) {
        questionCategory.innerHTML = questionObj[question]["category"];
    }

    questionSectionDom.appendChild(questionTitle);
    questionSectionDom.appendChild(questionCategory);
}

function makeSingleAnswerSlide(roundObj, questionObj) {
    var imgRatio = 1;
    var questionDOM = document.createElement('section');

    setSlideHeader(questionDOM, question, roundObj, questionObj);


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


    questionDOM.appendChild(questionBody);

    return questionDOM;
}

function makeSingleQuestionSlide(roundObj, questionObj) {
    var imgRatio = 1;
    var questionDOM = document.createElement('section');

    setSlideHeader(questionDOM, question, roundObj, questionObj);

    var questionBody = document.createElement('section');

    var questionBodyQuestion = document.createElement('div');
    questionBodyQuestion.innerHTML = questionObj[question]["shortQuestion"];

    var questionBodyLongQuestion = document.createElement('aside');
    questionBodyLongQuestion.className = "notes";
    questionBodyLongQuestion.innerHTML = questionObj[question]["longQuestion"];

    questionBody.appendChild(questionBodyQuestion);
    questionBody.appendChild(questionBodyLongQuestion);

    if (questionObj[question]["img"]) {
        console.log("restyling");
        var questionImg = document.createElement('img');
        questionImg.src = "images/" + questionObj[question]["img"].split(":")[0];
        imgRatio = questionObj[question]["img"].split(":")[1] || 1;
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