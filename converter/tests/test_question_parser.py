from converter.question_parser import readSingleFile, getAllQuestionsFromFiles

def test_ifTheLanguageIsDutch_andValidTextInputIsGiven_ThenAQuestionIsMade():
	foundQuestions = readSingleFile("tests/resources/SingleMinimalQuestion_NL.txt", "NL")
	assert len(foundQuestions) == 1
	
	question = foundQuestions[0]
	assert question.longQuestion == "This is the long question?"
	assert question.shortQuestion == "This is the short question?"
	assert question.answer == "This is the answer"
	assert question.category == "This is the category"
	assert question.round == "This is the round"


def test_ifTheLanguageIsDutch_andValidTextInputIsGiven_ThenAQuestionIsMade():
	foundQuestions = readSingleFile("tests/resources/SingleQuestion_withImage_NL.txt", "NL")
	assert len(foundQuestions) == 1

	question = foundQuestions[0]
	assert question.img == "testImage.jpg"

def test_ifTheLanguageIsEnglish_andValidTextInputIsGiven_ThenAQuestionIsMade():
	foundQuestions = readSingleFile("tests/resources/SingleMinimalQuestion_EN.txt", "EN")
	assert len(foundQuestions) == 1
	
	question = foundQuestions[0]
	assert question.longQuestion == "This is the long question?"
	assert question.shortQuestion == "This is the short question?"
	assert question.answer == "This is the answer"
	assert question.category == "This is the category"
	assert question.round == "This is the round"
	
def test_ifOneFileHasMultipleDefinitions_ThenMultipleQuestionsAreMade():
	foundQuestions = readSingleFile("tests/resources/MultipleMinimalQuestions_NL.txt", "NL")
	assert len(foundQuestions) == 2
	
	question = foundQuestions[0]
	assert question.longQuestion == "This is the long question?"
	assert question.shortQuestion == "This is the short question?"
	assert question.answer == "This is the answer"
	assert question.category == "This is the category"
	assert question.round == "This is the round"
	
	question = foundQuestions[1]
	assert question.longQuestion == "This is the long question 2?"
	assert question.shortQuestion == "This is the short question 2?"
	assert question.answer == "This is the answer 2"
	assert question.category == "This is the category 2"
	assert question.round == "This is the round 2"

def test_ifTextSpansMultipleLines_thenANewlineShouldBeAddedToTheTextContent():
	#Be aware that code supporting these newlines should be added to the Presenter code as well!!
	foundQuestions = readSingleFile("tests/resources/SingleQuestion_withNewlines_NL.txt", "NL")
	assert len(foundQuestions) == 1

	question = foundQuestions[0]
	assert question.longQuestion == r"This is the long question?\nIt contains a new line"
	assert question.shortQuestion == r"This is the short question?\nwhich also contains a new line"
	assert question.answer == r"This is the answer\nnew line is allowed here as well"
	assert question.category == "This is the category"
	assert question.round == "This is the round"

def test_ifSoundFieldIsFilledIn_thisIsRetrievableFromTheQuestion():
	foundQuestions = readSingleFile("tests/resources/SingleQuestion_withMusicFile.txt", "NL")
	assert len(foundQuestions) == 1

	question = foundQuestions[0]
	assert question.sound == "testRecording.mp3"

def test_ifMultipleInputFilesAreUsed_allQuestionsAreRetrievable():
	allQuestions = getAllQuestionsFromFiles(
		["tests/resources/SingleMinimalQuestion_NL.txt","tests/resources/SingleQuestion_withNewlines_NL.txt"], "NL")
	assert len(allQuestions) == 2

