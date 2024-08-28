describe('Title Slides', function() {
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
    it("questions should have a br tag in the sections", function() {
        var questionObj = new QuestionObjBuilder()
            .withAnswer("Yes,\\nit is")
            .withLongQuestion("This is a\\nlong question?")
            .withShortQuestion("This is a\\nshort question?")
            .build();


        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("presentedQuestion")[0].innerHTML).toBe("This is a<br>short question?");
        expect(questionSlide.getElementsByClassName("notesQuestion")[0].innerHTML).toBe("This is a<br>long question?");



    });
    it("answers should have a br tag in the sections", function() {
        var questionObj = new QuestionObjBuilder()
            .withAnswer("Yes,\\nit is")
            .withLongQuestion("This is a\\nlong question?")
            .withShortQuestion("This is a\\nshort question?")
            .build();

        let answerSlide = makeSingleAnswerSlide("Automated Test Round", questionObj, 0);
        expect(answerSlide.getElementsByClassName("answer")[0].innerHTML).toBe("[Yes,<br>it is]");

        expect(answerSlide.getElementsByClassName("presentedQuestion")[0].innerHTML).toBe("This is a<br>short question?");
        expect(answerSlide.getElementsByClassName("notesQuestion")[0].innerHTML).toBe("This is a<br>long question?");



    });
});

describe('Single Questions', function() {
    it("should be a section", function() {
        var questionObj = new QuestionObjBuilder().build();

        let questionSlide = makeRoundTitleSlide(questionObj);
        expect(questionSlide.nodeName).toBe("SECTION");
    });

    it("should have a single digit in the title", function() {
        var questionObj = new QuestionObjBuilder().build();

        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("questionTitle")[0].innerText).toBe("Automated Test Round - Vraag 1");
    });

    it("should contain the short question in the content", function() {
        var questionObj = new QuestionObjBuilder().withShortQuestion("This is a short question?").build();

        // var questionObj = {
        //     "shortQuestion": "This is a short question?",
        //     "longQuestion": "This is a long question?",
        //     "answer": "Yes, it is"
        // }

        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("presentedQuestion")[0].innerText).toBe("This is a short question?");
    });

    it("should contain the long question in the notes", function() {
        var questionObj = new QuestionObjBuilder().withLongQuestion("The format of this question is long, for the presenter to read during the quiz?").build();
        // var questionObj = {
        //     "shortQuestion": "This is a short question?",
        //     "longQuestion": "The format of this question is long, for the presenter to read during the quiz?",
        //     "answer": "Yes, it is"
        // }

        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("notesQuestion")[0].innerText).toBe("The format of this question is long, for the presenter to read during the quiz?")
    });
});



describe('Questions with sound', function() {
    it("should have an audio child", function() {
        var questionObj = new QuestionObjBuilder().withSound("testRecording.mp3").build();

        let questionSlide = makeSingleQuestionSlide("Automated Test Round", questionObj, 0);
        expect(questionSlide.getElementsByClassName("soundControl")).toBe("SECTION");
    });
});


class QuestionObjBuilder {
    constructor() {
        this.questionObj = {
            "shortQuestion": "This is a sound question?",
            "longQuestion": "This is a sound question?",
            "answer": "Yes, it is",
        }
    }

    withSound(pathToSoundFile) {
        this.questionObj["sound"] = pathToSoundFile;
        return this;
    }
    withLongQuestion(longQuestion) {
        this.questionObj["longQuestion"] = longQuestion;
        return this;
    }
    withShortQuestion(shortQuestion) {
        this.questionObj["shortQuestion"] = shortQuestion;
        return this;
    }
    withAnswer(answer) {
        this.questionObj["answer"] = answer;
        return this;
    }

    build() {
        return this.questionObj;
    }
}