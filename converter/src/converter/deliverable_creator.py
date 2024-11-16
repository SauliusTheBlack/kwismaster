from shutil import copy2, rmtree, copytree
import os
import glob

def __copy_tree(src, dst, symlinks=False, ignore=None):
	for item in os.listdir(src):
		s = os.path.join(src, item)
		d = os.path.join(dst, item)
		print(s,d)
		if os.path.isdir(s):
			copytree(s, d, symlinks, ignore)
		else:
			copy2(s, d)

def copyScoreKeeper(settings):
	print("Trying to copy from " + settings.sourceDir + "/scoreKeeper to " + settings.projectDir + "/scoreKeeper" )
	if os.path.exists(settings.projectDir + "/scoreKeeper"):
		rmtree(settings.projectDir + "/scoreKeeper")

	os.makedirs(settings.projectDir + "/scoreKeeper")
	__copy_tree(settings.sourceDir + "/scoreKeeper", settings.projectDir + "/scoreKeeper")

def copyScorePresenter(title, settings, rounds):
	if os.path.exists(settings.projectDir + "/scoreboard"):
		rmtree(settings.projectDir + "/scoreboard")

	os.makedirs(settings.projectDir + "/scoreboard")
	__copy_tree(settings.sourceDir + "/revealScore", settings.projectDir + "/scoreboard")

	with open(settings.projectDir + "/scoreboard/" + "scoreboard.html") as r:
		scoreboard = r.read()\
			.replace("@TEMPLATE_TITLE@", title)\
			.replace("@REVEAL_PATH@", "../../reveal")\

	with open(settings.projectDir + "/scoreboard/" + "scoreboard.html", "w") as w:
		w.write(scoreboard)

	with open(settings.projectDir + "/scoreboard/" + "scoreboard.js") as r:
		scoreboardJs = r.read()\
			.replace("var rounds = [];", 'var rounds = ' + str(rounds) + ";")\

	with open(settings.projectDir + "/scoreboard/" + "scoreboard.js", "w") as w:
		w.write(scoreboardJs)

def copyPresenter(title, settings):
	for file in glob.glob(settings.projectDir + "/../revealPresenter/kwismaster*"):
		copy2(file, settings.projectDir)

	with open("kwismaster.html") as r:
		kwismaster = r.read()\
			.replace("@TEMPLATE_TITLE@", title)\
			.replace("@SETTINGSJS@", settings.kwisMasterInOutDir + "/settings.js")\
			.replace("@QUESTIONSJS@", settings.kwisMasterInOutDir + "/questions.js")\
			.replace("@REVEAL_PATH@", "../reveal")\

	with open("kwismaster.html", "w") as w:
		w.write(kwismaster)