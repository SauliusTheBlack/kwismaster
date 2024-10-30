def _writePresentationText(targetFolder : str, roundObj : dict):
    with open(targetFolder + "/presentationText_" + roundObj["name"] + ".txt", 'w') as presenterText:
        presenterText.write(roundObj["name"] + "\n")
        for questionNumber, question in enumerate(roundObj["questions"]):
            presenterText.write(str(questionNumber + 1) + ": " + question.longQuestion + "\n")

def _writeAnswerText(targetFolder : str, roundObj : dict):
    with open(targetFolder + "/presentationText_" + roundObj["name"] + "_answers.txt", 'w') as answerText:
        answerText.write(f"\n\nAntwoorden {roundObj['name']}:\n")
        # Exclude Rode Draad from answersheet?
        for questionNumber, question in enumerate(roundObj["questions"]):
            answerText.write(str(questionNumber + 1) + ": " + question.shortQuestion + "\n")
            answerText.write("\t- " + question.answer + "\n\n")

def writeRoundPresentationText(targetFolder : str, roundObj : dict):
    _writePresentationText(targetFolder, roundObj)
    _writeAnswerText(targetFolder, roundObj)


