import json
import sys

# this makes classes serialisable
class MyEncoder(json.JSONEncoder):
	def default(self, o):
		return o.__dict__   

class Question:
	def __init__(self):
		pass
		
	def setLongQuestion(self, txt):
		self.longQuestion = txt.strip()
		
	def setShortQuestion(self, txt):
		self.shortQuestion = txt.strip()
		
	def setAnswer(self, txt):
		self.answer = txt.strip()
		
	def setImg(self, txt):
		self.img = txt.strip()
		
	def setCategory(self, txt):
		self.category = txt.strip()
		
	def setRound(self, txt):
		self.round = txt.strip()

	def setSourceFile(self, txt):
		self.sourceFile = txt

	def __repr__(self) -> str:
		return self.round + " - " + self.category + " - " + self.shortQuestion 

def readSingleFile(filename):
	fileQuestions = []
	
	print("Reading " + filename)
	currentQuestion = None
	with open(filename ,'r', encoding='utf-8') as questionFile:		
		for line in questionFile:
			print(line)
			if not ':' in line:
				continue			
			key, value = line.split(':',1)
			print(key,"-",value)
			if value.strip() == "/" or value.strip() == "\\":
				print("Skipping line " + line + " because content is single forward or backward slash")
				continue

			if key.lower().strip() == "lange vraag":
				if(currentQuestion):
					currentQuestion.setSourceFile(filename)
					fileQuestions.append(currentQuestion)				
				currentQuestion = Question()
				currentQuestion.setLongQuestion(value)
			elif key.lower().strip() == "korte vraag":
				currentQuestion.setShortQuestion(value)
			elif key.lower().strip() == "antwoord":
				currentQuestion.setAnswer(value)
			elif key.lower().strip() == "afbeelding":
				currentQuestion.setImg(value)
			elif key.lower().strip() == "categorie":
				currentQuestion.setCategory(value)
			elif key.lower().strip() == "ronde":
				currentQuestion.setRound(value)
			else:
				print(f"Skipping line {line}")

	if currentQuestion:
		currentQuestion.setSourceFile(filename)
		fileQuestions.append(currentQuestion)
		
	return fileQuestions



if __name__ == '__main__':
	allQuestionsByRoundMap = {}		

	baseInOutDir = ".." 
	outDir = baseInOutDir + "/revealPresenter" 
	outFilename = outDir + "/questions.js"

	with open(sys.argv[1],"r") as f:
		config = json.load(f)

	with open(baseInOutDir + "/kwismaster.json","r") as g:
		lines = g.readlines()

	with open(baseInOutDir + "/revealPresenter/settings.js","w") as h:
		h.write("var settings = ")
		h.writelines(lines)

	category_order = config["category_order"]
	infiles = config["input_files"]
	rounds = config["rounds"]
	specifications = config["specs"]

	for fileName in infiles:
		allQuestions = readSingleFile(baseInOutDir+"/"+fileName)

	import re
	import copy
	#loop over the rounds, find if there is a round that has a CATEGORY: spec, and create a new round containing these questions
	allQuestions.sort(key=lambda question: [round.lower() for round in rounds].index(question.round.lower()))
	questionsToAppend = []
	for round in rounds:
		if round in specifications:
			roundSpecs = specifications[round]
			print(round + ": " + str(roundSpecs))
			categoryPattern = re.compile("CATEGORY:.*")
			matchingPatterns = list(filter(categoryPattern.match, roundSpecs))
			print(matchingPatterns)
			if(matchingPatterns):
				print("Category found, need to filter all rounds for this category now")
				
				categoryToExtract = matchingPatterns[0].split(":")[1]
				print("Extracting " + categoryToExtract)
				for question in allQuestions:
					if question.category == categoryToExtract:
						print(question)					
						q = copy.deepcopy(question)
						q.setRound(round)
						print(q)
						questionsToAppend.append(q)

	print(len(allQuestions))
	allQuestions.extend(questionsToAppend)

	#Sort the question list by the round value for every question object, so that it matches the Rounds value in the spec file
	allQuestions.sort(key=lambda question: [round.lower() for round in rounds].index(question.round.lower()))

	print(len(allQuestions))

	questions = []
	currentRound = None
	currentRoundName = ""
	currentRoundQuestions = []
	for question in allQuestions:
		if currentRoundName != question.round.strip():
			if(currentRound != None):
				currentRound["name"] = currentRoundName
				currentRound["questions"] = currentRoundQuestions
				if(currentRoundName in rounds):
					questions.append(currentRound)

				currentRoundQuestions = []
			currentRound = {}
			currentRoundName = question.round.strip()
		currentRoundQuestions.append(question)

	currentRound["name"] = currentRoundName
	currentRound["questions"] = currentRoundQuestions
	if(currentRoundName in rounds): 
		questions.append(currentRound)


	print(questions)

	#this next part is not optimized for performance or resource utilisation, but works fine
	for round in questions:
		if (round["name"] in specifications and 'NO_CATEGORY_SORT' in specifications[round["name"]]):
			print(f"Not sorting {round['name']}")
		else:
			print(f"sorting {round['name']} by category")
			round["questions"].sort(key=lambda x: [co.lower() for co in category_order].index(x.category.lower()))
		
		with open(outDir + "/presentationText_"+round["name"]+".txt", 'w') as presenterText:
			presenterText.write(round["name"] + "\n")
			for questionNumber, question in enumerate(round["questions"]):
				presenterText.write(str(questionNumber + 1) + ": " + question.longQuestion + "\n\n")

		with open(outDir + "/presentationText_"+round["name"]+"_answers.txt", 'w') as answerText:
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
