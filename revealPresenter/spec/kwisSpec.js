describe('titleslides', function() {
    it("should be a section", function() {
        var roundObj = {
            "name": "Ronde 1",
            "questions": []
        }

        let titleSlide = makeRoundTitleSlide(roundObj);
        expect(titleSlide.nodeName).toBe("SECTION");
    });
});

describe('questions with newlines', function() {
    var questionObj = {
        "shortQuestion": "This is a\\nshort question?",
        "longQuestion": "This is a\\nlong question?",
        "answer": "Yes,\\nit is"
    }

    it("questions should have a br tag in the sections", function() {


        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("presentedQuestion")[0].innerHTML).toBe("This is a<br>short question?");
        expect(questionSlide.getElementsByClassName("notesQuestion")[0].innerHTML).toBe("This is a<br>long question?");



    });
    it("answers should have a br tag in the sections", function() {
        let answerSlide = makeSingleAnswerSlide("Automated Test Round", questionObj, 0);
        expect(answerSlide.getElementsByClassName("answer")[0].innerHTML).toBe("[Yes,<br>it is]");

        expect(answerSlide.getElementsByClassName("presentedQuestion")[0].innerHTML).toBe("This is a<br>short question?");
        expect(answerSlide.getElementsByClassName("notesQuestion")[0].innerHTML).toBe("This is a<br>long question?");



    });
});

describe('singleQuestion', function() {
    it("should be a section", function() {
        var questionObj = {
            "shortQuestion": "This is a short question?",
            "answer": "Yes, it is"
        }

        let questionSlide = makeRoundTitleSlide(questionObj);
        expect(questionSlide.nodeName).toBe("SECTION");
    });

    it("should have a single digit in the title", function() {
        var questionObj = {
            "shortQuestion": "This is a short question?",
            "longQuestion": "This is a long question?",
            "answer": "Yes, it is"
        }

        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("questionTitle")[0].innerText).toBe("Automated Test Round - Vraag 1");
    });

    it("should contain the short question in the content", function() {
        var questionObj = {
            "shortQuestion": "This is a short question?",
            "longQuestion": "This is a long question?",
            "answer": "Yes, it is"
        }

        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("presentedQuestion")[0].innerText).toBe("This is a short question?");
    });

    it("should contain the long question in the notes", function() {
        var questionObj = {
            "shortQuestion": "This is a short question?",
            "longQuestion": "The format of this question is long, for the presenter to read during the quiz?",
            "answer": "Yes, it is"
        }

        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("notesQuestion")[0].innerText).toBe("The format of this question is long, for the presenter to read during the quiz?")
    });
});