import json
import sys, os

from question_parser import getAllQuestionsFromFiles
from file_creator import writeRoundPresentationText
from deliverable_creator import copyPresenter, copyScoreKeeper, copyScorePresenter
from util import Settings
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
					if qst.category == categoryToExtract:
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


def create_settings(configFileArg):
	_settings = Settings()
	_settings.configFile = os.path.abspath(configFileArg)
	# the following assumes the sourceDir is one level higher, and the project dir is current folder.
	# This should become settable in the configFile
	# This is the most priority TODO
	_settings.sourceDir = os.path.abspath(configFileArg + "\\..\\..")
	_settings.projectDir = os.path.dirname(os.path.abspath(configFileArg))
	_settings.baseInOutDir = _settings.projectDir
	if not _settings.validate():
		print(_settings.error_messages)
		exit()
	return _settings


if __name__ == '__main__':

	if len(sys.argv) == 1:
		usage()

	settings = create_settings(sys.argv[1])

	with open(settings.configFile,"r", encoding='utf-8') as f:
		config = json.load(f)
		lines = f.readlines()

		if "settings" in config:
			if "output_dir" in config["settings"]:
				print(f'appending custom base dir [{config["settings"]["output_dir"]}] to [{settings.baseInOutDir}]')
				settings.baseInOutDir += "/" + config["settings"]["output_dir"]
				kwisMasterInOutDir = config["settings"]["output_dir"]

	allQuestionsByRoundMap = {}
	

	if not os.path.exists(settings.baseInOutDir):
		os.makedirs(settings.baseInOutDir)


	category_order = config["category_order"]
	print([co.lower() for co in category_order])
	infiles = config["input_files"]
	rounds = config["rounds"]
	specifications = {}
	if "specs" in config:
		specifications = config["specs"]

	allInputFiles = [settings.projectDir + "\\" + infile for infile in infiles]
	print("Detecting language based on first line of " + allInputFiles[0])
	with open(allInputFiles[0], 'r') as f:
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

	for rnd in questions:
		if rnd["name"] == "Ronde ABC":
			continue
		categoryMap = {}
		for question in rnd["questions"]:
			if question.category not in categoryMap:
				categoryMap[question.category] = 0
			categoryMap[question.category] += 1
		print(rnd["name"] + ": " + str(len(rnd["questions"])) + " vragen" + str(categoryMap))



	print(rounds)

	with open("rounds.txt", "w") as roundsFile:
		for rnd in rounds:
			roundsFile.write(rnd + "\n")
	copyPresenter(config["title"], settings)
	copyScoreKeeper(settings)
	copyScorePresenter(config["title"], settings, rounds)

	outFilename = settings.projectDir + "\\presenter\\questions.js"
	with open(outFilename, "w") as outfile:
		print(f'writing to {outFilename}')
		round_object = json.dumps(questions, indent=4, cls=MyEncoder)
		outfile.write("questions = ")
		outfile.write(round_object)

	settingsFileName = settings.projectDir + "\\presenter\\settings.js"
	with open(settingsFileName,"w") as h:
		h.write("var settings = {}")
		h.writelines(lines)