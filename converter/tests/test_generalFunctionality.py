from src.converter.convert import readSingleFile

def test_singleQuestion():
	foundQuestions = readSingleFile("tests/resources/SingleMinimalQuestion_NL.txt")
	assert len(foundQuestions) == 1
	
	question = foundQuestions[0]
	assert question.longQuestion == "This is the long question?"
	assert question.shortQuestion == "This is the short question?"
	assert question.answer == "This is the answer"
	assert question.category == "This is the category"
	assert question.round == "This is the round"
	
def test_multipleQuestions():
	foundQuestions = readSingleFile("tests/resources/MultipleMinimalQuestions_NL.txt")
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

#maintain newlines in strings
def test_lineWithoutPrefixShouldBeAddedToPreviousObject():
	foundQuestions = readSingleFile("tests/resources/SingleQuestion_withNewlines_NL.txt")
	assert len(foundQuestions) == 1
	
	question = foundQuestions[0]
	assert question.longQuestion == r"This is the long question?\nIt contains a new line"
	assert question.shortQuestion == r"This is the short question?\nwhich also contains a new line"
	assert question.answer == r"This is the answer\nnew line is allowed here as well"
	assert question.category == "This is the category"
	assert question.round == "This is the round"