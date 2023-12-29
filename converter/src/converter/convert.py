import json
import sys, os
from translations import translations

# this makes classes serialisable
class MyEncoder(json.JSONEncoder):
	def default(self, o):
		return o.__dict__

class Question:
	def __init__(self):
		self.longQuestion = ""
		self.shortQuestion = ""
		self.answer = ""
		
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

	def setSourceFile(self, txt):
		self.sourceFile = txt

	def appendToLastUsedField(self, txt):
		self.lastUsed(r"\n" + txt.strip())

	def __repr__(self) -> str:
		return self.round + " - " + self.category + " - " + self.shortQuestion 

#parse the user friendly syntax to Question objects
def readSingleFile(filename):
	fileQuestions = []
	
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

			#lange vraag, or its translation, should be the first line in a block, if you encounter it, finish the current question
			if key.lower().strip() == translations["NL"]["longQuestion"].lower().strip():
				if(currentQuestion):
					currentQuestion.setSourceFile(filename)
					fileQuestions.append(currentQuestion)				
				currentQuestion = Question()
				currentQuestion.setLongQuestion(value)
			elif key.lower().strip() == translations["NL"]["shortQuestion"].lower().strip():
				currentQuestion.setShortQuestion(value)
			elif key.lower().strip() == translations["NL"]["answer"].lower().strip():
				currentQuestion.setAnswer(value)
			elif key.lower().strip() == translations["NL"]["image"].lower().strip():
				currentQuestion.setImg(value)
			elif key.lower().strip() == translations["NL"]["category"].lower().strip():
				currentQuestion.setCategory(value)
			elif key.lower().strip() == translations["NL"]["round"].lower().strip():
				currentQuestion.setRound(value)
			else:
				print(f"Skipping line {line}")

	# no more "lange vraag" line means you have to write the current ongoing question
	if currentQuestion:
		currentQuestion.setSourceFile(filename)
		fileQuestions.append(currentQuestion)

	return fileQuestions

def getAllQuestionsOrderedByRoundSpec(unhandledQuestions):
	import re
	import copy
	#loop over the rounds, find if there is a round that has a CATEGORY: spec, and create a new round containing these questions
	print(unhandledQuestions)
	unhandledQuestions.sort(key=lambda question: [round.lower() for round in rounds].index(question.round.lower()))
	questionsToAppend = []
	for round in rounds:
		if round in specifications:
			roundSpecs = specifications[round]
			categoryPattern = re.compile("CATEGORY:.*")
			matchingPatterns = list(filter(categoryPattern.match, roundSpecs))
			if(matchingPatterns):
				categoryToExtract = matchingPatterns[0].split(":")[1]
				for question in allQuestions:
					if question.category == categoryToExtract:
						q = copy.deepcopy(question)
						q.setRound(round)
						questionsToAppend.append(q)

	unhandledQuestions.extend(questionsToAppend)

	#Sort the question list by the round value for every question object, so that it matches the Rounds value in the spec file
	unhandledQuestions.sort(key=lambda question: [round.lower() for round in rounds].index(question.round.lower()))
	return unhandledQuestions

def getAllQuestionsFromFiles(inFiles):
	allQuestions = []
	for fileName in inFiles:
		allQuestions += readSingleFile(fileName)
	return allQuestions

usageText = """
USAGE:
convert.py configFile.json

see readme for configFile contents
"""

def usage():
	print(usageText)
	exit()

if __name__ == '__main__':
	if len(sys.argv) == 1:
		usage()

	configFile = os.path.abspath(sys.argv[1])
	baseInOutDir = os.path.abspath(sys.argv[1] + "/..")
	with open(configFile,"r") as f:
		config = json.load(f)
		lines = f.readlines()

		if("base_dir" in config["settings"]):
			print(f'appending custom base dir [{config["settings"]["base_dir"]}] to [{baseInOutDir}]')
			baseInOutDir += "/" + config["settings"]["base_dir"]

	allQuestionsByRoundMap = {}		
	outFilename = baseInOutDir + "/questions.js"
	
	with open(baseInOutDir + "/settings.js","w") as h:
		h.write("var settings = {}")
		h.writelines(lines)

	category_order = config["category_order"]
	infiles = config["input_files"]
	rounds = config["rounds"]
	specifications = config["specs"]

	allQuestions = getAllQuestionsFromFiles([baseInOutDir+"/" + infile for infile in infiles])
	questionSortedByRound = getAllQuestionsOrderedByRoundSpec(allQuestions)

	questions = []
	currentRound = None
	currentRoundName = ""
	currentRoundQuestions = []
	for question in questionSortedByRound:
		if currentRoundName != question.round.strip():
			if(currentRound != None):
				currentRound["name"] = currentRoundName
				currentRound["questions"] = currentRoundQuestions
				if(currentRoundName in rounds):
					questions.append(currentRound)
				else:
					print(f"Couldn't find round '{currentRoundName}' in rounds {rounds}")

				currentRoundQuestions = []
			currentRound = {}
			currentRoundName = question.round.strip()
		currentRoundQuestions.append(question)

	currentRound["name"] = currentRoundName
	currentRound["questions"] = currentRoundQuestions
	if(currentRoundName in rounds): 
		questions.append(currentRound)

	#this next part is not optimized for performance or resource utilisation, but works fine
	for round in questions:
		if (round["name"] in specifications and 'NO_CATEGORY_SORT' in specifications[round["name"]]):
			print(f"Not sorting {round['name']}")
		else:
			print(f"sorting {round['name']} by category")
			round["questions"].sort(key=lambda x: [co.lower() for co in category_order].index(x.category.lower()))
		
		with open(baseInOutDir + "/presentationText_"+round["name"]+".txt", 'w') as presenterText:
			presenterText.write(round["name"] + "\n")
			for questionNumber, question in enumerate(round["questions"]):
				presenterText.write(str(questionNumber + 1) + ": " + question.longQuestion + "\n\n")

		with open(baseInOutDir + "/presentationText_"+round["name"]+"_answers.txt", 'w') as answerText:
			answerText.write(f"\n\nAntwoorden {round['name']}\n\n\n")
			# Exclude Rode Draad from answersheet?
			for questionNumber, question in enumerate(round["questions"]):
				answerText.write(str(questionNumber + 1) + ": " + question.shortQuestion + "\n")
				answerText.write("\t - " + question.answer + "\n\n")
			

	round_object = json.dumps(questions, indent=4, cls=MyEncoder)


	for round in questions:
		if round["name"] == "Ronde ABC":
			continue
		categoryMap = {}
		for question in round["questions"]:
			if question.category not in categoryMap:
				categoryMap[question.category] = 0
			categoryMap[question.category] += 1
		print(round["name"] + ": " + str(len(round["questions"])) + " vragen" + str(categoryMap))

	with open(outFilename, "w") as outfile:
		print(f'writing to {outFilename}')
		outfile.write("questions = ")
		outfile.write(round_object)
