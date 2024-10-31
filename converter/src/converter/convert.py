import json
import sys, os

from question_parser import getAllQuestionsFromFiles
from file_creator import writeRoundPresentationText
from deliverable_creator import enablePresenter, primeScoreKeeper, copyScorePresenter

# this makes classes serialisable
class MyEncoder(json.JSONEncoder):
	def default(self, o):
		return o.__dict__

def getAllQuestionsOrderedByRoundSpec(unhandledQuestions):
	import re
	import copy

	# Sort questions based on the round they appear in, using the rounds list as a reference
	unhandledQuestions.sort(key=lambda qst: [rnd.lower() for rnd in rounds].index(qst.round.lower()))
	questionsToAppend = []
	for rnd in rounds:
		if rnd in specifications:
			roundSpecs = specifications[rnd]
			categoryPattern = re.compile("CATEGORY:.*")
			matchingPatterns = list(filter(categoryPattern.match, roundSpecs))
			if matchingPatterns:
				categoryToExtract = matchingPatterns[0].split(":")[1]
				for qst in allQuestions:
					if question.category == categoryToExtract:
						q = copy.deepcopy(qst)
						q.setRound(rnd)
						questionsToAppend.append(q)

	unhandledQuestions.extend(questionsToAppend)

	#Sort the question list by the round value for every question object, so that it matches the Rounds value in the spec file
	unhandledQuestions.sort(key=lambda question: [rnd.lower() for rnd in rounds].index(question.round.lower()))
	return unhandledQuestions


usageText = """
USAGE:
convert.py configFile.json

see readme for configFile contents
"""

def usage():
	print(usageText)
	exit()




def detectLanguage(line):
	if line.lower().startswith("lange vraag"):
		return "NL"
	elif line.lower().startswith("long question"):
		return "EN"
	else:
		return None

class Settings:
	def __init__(self):
		self.configFile = None
		self.projectDir = None
		self.baseInOutDir = None
		self.kwisMasterInOutDir = '.'

if __name__ == '__main__':
	settings = Settings()
	if len(sys.argv) == 1:
		usage()

	settings.configFile = os.path.abspath(sys.argv[1])
	settings.projectDir = os.path.abspath(sys.argv[1] + "/..")
	settings.baseInOutDir = settings.projectDir

	with open(settings.configFile,"r", encoding='utf-8') as f:
		config = json.load(f)
		lines = f.readlines()

		if "settings" in config:
			if "output_dir" in config["settings"]:
				print(f'appending custom base dir [{config["settings"]["output_dir"]}] to [{settings.baseInOutDir}]')
				settings.baseInOutDir += "/" + config["settings"]["output_dir"]
				kwisMasterInOutDir = config["settings"]["output_dir"]

	allQuestionsByRoundMap = {}
	outFilename = settings.baseInOutDir + "/questions.js"

	if not os.path.exists(settings.baseInOutDir):
		os.makedirs(settings.baseInOutDir)

	with open(settings.baseInOutDir + "/settings.js","w") as h:
		h.write("var settings = {}")
		h.writelines(lines)

	category_order = config["category_order"]
	print([co.lower() for co in category_order])
	infiles = config["input_files"]
	rounds = config["rounds"]
	specifications = {}
	if "specs" in config:
		specifications = config["specs"]

	allInputFiles = [settings.projectDir + "/" + infile for infile in infiles]
	with open(allInputFiles[0]) as f:
		first_line = f.readline().strip('\n')
	language = detectLanguage(first_line)

	allQuestions = getAllQuestionsFromFiles(allInputFiles, language)
	questionSortedByRound = getAllQuestionsOrderedByRoundSpec(allQuestions)

	questions = []
	currentRound = None
	currentRoundName = ""
	currentRoundQuestions = []
	for question in questionSortedByRound:
		if currentRoundName != question.round.strip():
			if currentRound is not None:
				currentRound["name"] = currentRoundName
				currentRound["questions"] = currentRoundQuestions
				if currentRoundName in rounds:
					questions.append(currentRound)
				else:
					print(f"Couldn't find round '{currentRoundName}' in rounds {rounds}")

				currentRoundQuestions = []
			currentRound = {}
			currentRoundName = question.round.strip()
		currentRoundQuestions.append(question)

	currentRound["name"] = currentRoundName
	currentRound["questions"] = currentRoundQuestions
	if currentRoundName in rounds:
		questions.append(currentRound)

	#this next part is not optimized for performance or resource utilisation, but works fine
	for roundWithQuestions in questions:
		if roundWithQuestions["name"] in specifications and 'NO_CATEGORY_SORT' in specifications[roundWithQuestions["name"]]:
			print(f"Not sorting {roundWithQuestions['name']}")
		else:
			print(f"sorting {roundWithQuestions['name']} by category")
			try:
				roundWithQuestions["questions"].sort(key=lambda x: [co.lower() for co in category_order].index(x.category.lower()))
			except ValueError as ve:
				print(ve)
				print("Could not find category in {}, please check category_order in {}".format(category_order, settings.configFile))
				exit()

		writeRoundPresentationText(settings.baseInOutDir, roundWithQuestions)


	round_object = json.dumps(questions, indent=4, cls=MyEncoder)


	for rnd in questions:
		if rnd["name"] == "Ronde ABC":
			continue
		categoryMap = {}
		for question in rnd["questions"]:
			if question.category not in categoryMap:
				categoryMap[question.category] = 0
			categoryMap[question.category] += 1
		print(rnd["name"] + ": " + str(len(rnd["questions"])) + " vragen" + str(categoryMap))

	with open(outFilename, "w") as outfile:
		print(f'writing to {outFilename}')
		outfile.write("questions = ")
		outfile.write(round_object)

	print(rounds)

	with open("rounds.txt", "w") as roundsFile:
		for rnd in rounds:
			roundsFile.write(rnd + "\n")
	enablePresenter(config["title"], settings)
	primeScoreKeeper(settings)
	copyScorePresenter(config["title"], settings, rounds)