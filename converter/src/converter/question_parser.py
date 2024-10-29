from translations import translations


class Question:
	def __init__(self):
		self.longQuestion = ""
		self.shortQuestion = ""
		self.answer = ""
		self.category = ""
		self.sound = ""
		
	def setLongQuestion(self, txt):
		self.longQuestion += txt.strip()
		self.lastUsed = self.setLongQuestion

	def setShortQuestion(self, txt):
		self.shortQuestion += txt.strip()
		self.lastUsed = self.setShortQuestion
		
	def setAnswer(self, txt):
		self.answer += txt.strip()
		self.lastUsed = self.setAnswer
		
	def setImg(self, txt):
		self.img = txt.strip()
		
	def setCategory(self, txt):
		self.category = txt.strip()
		
	def setRound(self, txt):
		self.round = txt.strip()

	def setSound(self, filename):
		self.sound = filename.strip()

	def setSourceFile(self, txt):
		self.sourceFile = txt

	def appendToLastUsedField(self, txt):
		self.lastUsed(r"\n" + txt.strip())

	def __repr__(self) -> str:
		return self.round + " - " + self.category + " - " + self.shortQuestion


def getAllQuestionsFromFiles(inFiles, language):
	allQuestions = []
	for fileName in inFiles:
		allQuestions += readSingleFile(fileName, language)
	return allQuestions

#parse the user friendly syntax to Question objects
def readSingleFile(filename, language="EN"):
	fileQuestions = []

	keywords = translations[language]

	print("Reading " + filename)
	currentQuestion = None
	with open(filename ,'r', encoding='utf-8') as questionFile:		
		for line in questionFile:
			if not ':' in line:
				if currentQuestion and line != "\n":
					currentQuestion.appendToLastUsedField(line)
				continue

			key, value = line.split(':',1)
			if value.strip() == "/" or value.strip() == "\\":
				print("Skipping line " + line + " because content is single forward or backward slash")
				continue

			if key.lower().strip() == keywords["longQuestion"].lower().strip():
				if(currentQuestion):
					currentQuestion.setSourceFile(filename)
					fileQuestions.append(currentQuestion)				
				currentQuestion = Question()
				currentQuestion.setLongQuestion(value)
			elif key.lower().strip() == keywords["shortQuestion"].lower().strip():
				currentQuestion.setShortQuestion(value)
			elif key.lower().strip() == keywords["answer"].lower().strip():
				currentQuestion.setAnswer(value)
			elif key.lower().strip() == keywords["image"].lower().strip():
				currentQuestion.setImg(value)
			elif key.lower().strip() == keywords["category"].lower().strip():
				currentQuestion.setCategory(value)
			elif key.lower().strip() == keywords["round"].lower().strip():
				currentQuestion.setRound(value)
			elif key.lower().strip() == keywords["sound"].lower().strip():
				currentQuestion.setSound(value)
			else:
				print(f"Skipping line {line}")

	# no more "lange vraag" line means you have to write the current ongoing question
	if currentQuestion:
		currentQuestion.setSourceFile(filename)
		fileQuestions.append(currentQuestion)

	return fileQuestions

