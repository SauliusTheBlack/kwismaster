import json
import sys, os

from shutil import copy2, rmtree

from question_parser import getAllQuestionsFromFiles

import shutil
def copy_tree(src, dst, symlinks=False, ignore=None):
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, symlinks, ignore)
        else:
            shutil.copy2(s, d)

import glob

# this makes classes serialisable
class MyEncoder(json.JSONEncoder):
	def default(self, o):
		return o.__dict__

def getAllQuestionsOrderedByRoundSpec(unhandledQuestions):
	import re
	import copy

	# Sort questions based on the round they appear in, using the rounds list as a reference
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


usageText = """
USAGE:
convert.py configFile.json

see readme for configFile contents
"""

def usage():
	print(usageText)
	exit()

def primeScoreKeeper():
	print("Trying to copy from " + projectDir + "/../scoreKeeper to " + projectDir + "/scoreKeeper" )
	if os.path.exists(projectDir + "/scoreKeeper"):
		rmtree(projectDir + "/scoreKeeper")

	os.makedirs(projectDir + "/scoreKeeper")
	copy_tree(projectDir + "/../scoreKeeper", projectDir + "/scoreKeeper")

def copyScorePresenter(title):
	if os.path.exists(projectDir + "/scoreboard"):
		rmtree(projectDir + "/scoreboard")

	os.makedirs(projectDir + "/scoreboard")
	copy_tree(projectDir + "/../revealScore", projectDir + "/scoreboard")

	with open(projectDir + "/scoreboard/" + "scoreboard.html") as r:
		scoreboard = r.read()\
			.replace("@TEMPLATE_TITLE@", title)\
			.replace("@REVEAL_PATH@", "../../reveal")\
			
	with open(projectDir + "/scoreboard/" + "scoreboard.html", "w") as w:
		w.write(scoreboard)


	print(rounds, flush=True)
	with open(projectDir + "/scoreboard/" + "scoreboard.js") as r:
		scoreboardJs = r.read()\
			.replace("var rounds = [];", 'var rounds = ' + str(rounds) + ";")\
			
	with open(projectDir + "/scoreboard/" + "scoreboard.js", "w") as w:
		w.write(scoreboardJs)

def enablePresenter(title):
	for file in glob.glob(projectDir + "/../revealPresenter/kwismaster*"):
		print(file)
		copy2(file, projectDir)

	with open("kwismaster.html") as r:
		kwismaster = r.read()\
			.replace("@TEMPLATE_TITLE@", title)\
			.replace("@SETTINGSJS@", kwisMasterInOutDir + "/settings.js")\
			.replace("@QUESTIONSJS@", kwisMasterInOutDir + "/questions.js")\
			.replace("@REVEAL_PATH@", "../reveal")\
		
	with open("kwismaster.html", "w") as w:
		w.write(kwismaster)


def detectLanguage(line):
	if line.lower().startswith("lange vraag"):
		return "NL"
	elif line.lower().startswith("long question"):
		return "EN"
	else:
		return None


if __name__ == '__main__':
	if len(sys.argv) == 1:
		usage()


	configFile = os.path.abspath(sys.argv[1])
	projectDir = os.path.abspath(sys.argv[1] + "/..")
	baseInOutDir = projectDir
	kwisMasterInOutDir = '.'
	with open(configFile,"r", encoding='utf-8') as f:
		config = json.load(f)
		lines = f.readlines()

		if "settings" in config:
			if("output_dir" in config["settings"]):
				print(f'appending custom base dir [{config["settings"]["output_dir"]}] to [{baseInOutDir}]')
				baseInOutDir += "/" + config["settings"]["output_dir"]
				kwisMasterInOutDir = config["settings"]["output_dir"]
		

	allQuestionsByRoundMap = {}		
	outFilename = baseInOutDir + "/questions.js"
	
	if not os.path.exists(baseInOutDir):
		os.makedirs(baseInOutDir)

	with open(baseInOutDir + "/settings.js","w") as h:
		h.write("var settings = {}")
		h.writelines(lines)

	category_order = config["category_order"]
	print([co.lower() for co in category_order])
	infiles = config["input_files"]
	rounds = config["rounds"]
	specifications = {} 
	if "specs" in config:
		specifications = config["specs"]

	allInputFiles = [projectDir + "/" + infile for infile in infiles]
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
			try:
				round["questions"].sort(key=lambda x: [co.lower() for co in category_order].index(x.category.lower()))
			except ValueError as ve:
				print(ve)
				print("Could not find category in {}, please check category_order in {}".format(category_order, configFile))
				exit()
		
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
	print(rounds)

	with open("rounds.txt", "w") as roundsFile:
		for round in rounds:
			roundsFile.write(round + "\n")
	enablePresenter(config["title"])
	primeScoreKeeper()
	copyScorePresenter(config["title"])