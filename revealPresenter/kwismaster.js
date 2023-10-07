function makeQuestionSlides(roundObj, questionObj) {
    var roundTitleDOM = document.createElement('section');
    roundTitleDOM.innerHTML = roundObj["name"];

    slides.appendChild(roundTitleDOM);
    for (question in questionObj) {
        var questionDOM = document.createElement('section');

        var questionTitle = document.createElement('h4');
        var questionCategory = document.createElement('h5');
        var questionCounter = Number(question) + 1;
        questionTitle.innerHTML = roundObj["name"] + " - " + "Vraag " + questionCounter;
        questionCategory.innerHTML = questionObj[question]["category"];

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
            console.log("Show the image (" + roundObj["name"] + "){" + questionObj[question]["img"] + "}")
            var questionImg = document.createElement('img');
            questionImg.src = "images/" + questionObj[question]["img"];
            questionImg.style.height = '225px';
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
        console.log(questionObj[question]["category"], excludeQuestions);
        if (excludeQuestions.includes(questionObj[question]["category"])) {
            console.log("Excluding");
            continue;
        }
        var questionDOM = document.createElement('section');

        var questionTitle = document.createElement('div');
        var questionCategory = document.createElement('div');
        var questionCounter = Number(question) + 1;
        questionTitle.innerHTML = roundObj["name"] + " - " + "Vraag " + questionCounter;
        questionCategory.innerHTML = questionObj[question]["category"];

        var questionBody = document.createElement('section');
        var questionBodyQuestion = document.createElement('div');
        var questionBodyAnswer = document.createElement('div');

        questionBodyQuestion.innerHTML = questionObj[question]["shortQuestion"];
        questionBodyAnswer.innerHTML = "[" + questionObj[question]["answer"] + "]";
        questionBody.appendChild(questionBodyQuestion);
        if (questionObj[question]["img"]) {
            console.log("Show the image (" + roundObj["name"] + "){" + questionObj[question]["img"] + "}")
            var questionImg = document.createElement('img');
            questionImg.src = "images/" + questionObj[question]["img"];
            questionImg.style.height = '225px';
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
    var slides = Reveal.getSlidesElement();

    for (var round in questions) {
        var roundObj = questions[round];
        var questionObj = roundObj["questions"];

        makeQuestionSlides(roundObj, questionObj);
        makeAnswerSlides(roundObj, questionObj, ["Rode Draad"]);
    }

    // for (var round in questions) {
    //     var questionRound = questions[round];


    //     var title = document.createElement('div');
    //     title.innerHTML = questionRound.name;

    //     var titleOnly = document.createElement('div');
    //     titleOnly.innerHTML = questionRound.name;


    //     var roundSectionTitleOnly = document.createElement("section");
    //     roundSectionTitleOnly.appendChild(titleOnly);

    //     var roundSection = document.createElement("section");
    //     roundSection.appendChild(title);

    //     slides.appendChild(roundSectionTitleOnly);




    //     for (var question in questionRound["questions"]) {
    //         var subtitle = document.createElement('div');
    //         var questionQuestion = questionRound["questions"][question];
    //         var questionSection = document.createElement("section");

    //         var questionDiv = document.createElement("div");
    //         questionDiv.innerHTML = questionQuestion["shortQuestion"];
    //         questionSection.appendChild(subtitle);
    //         questionSection.appendChild(questionDiv);

    //         roundSection.appendChild(questionSection);

    //         slides.appendChild(roundSection);
    //     }


    // }
}

window.addEventListener("load", (event) => {
    domQuestions();
});