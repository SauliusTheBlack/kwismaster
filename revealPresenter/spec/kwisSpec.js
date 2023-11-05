describe('titleslides', function() {
    it("should be one section", function() {
        var roundObj = {
            "name": "Ronde 1",
            "questions": []
        }

        let roundTitleSlides = makeRoundTitleSlide(roundObj);
        expect(roundTitleSlides.nodeName).toBe("SECTION");
    });
});