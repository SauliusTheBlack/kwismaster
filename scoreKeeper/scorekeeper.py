# A simple HTTP server that supplies a page to keep the score for the kwismaster application.
# All data is kept in simple files for persistence and ease of adaptation, at the cost of some security


from bottle import get, post, run, template, TEMPLATE_PATH, redirect, app, request
from requests.exceptions import ConnectTimeout
from pathlib import Path
import os, pickle

scoreDelimiter = "@##@"
scoreFileName = "scores.pkl"
teamFileName = "teams.pkl"
scores = {}
if os.path.exists(scoreFileName):
	with open(scoreFileName, 'rb') as rf:
		scores = pickle.load(rf)

teams = {

}
if os.path.exists(teamFileName):
	with open(teamFileName, 'rb') as rf:
		teams = pickle.load(rf)

technicalTeamNameCache = {}
def getTechnicalTeamName(humanTeamName):
	if humanTeamName not in technicalTeamNameCache:
		technicalTeamNameCache[humanTeamName] = humanTeamName.lower().replace(" ","_")
	return technicalTeamNameCache[humanTeamName]

@post('/teams')
def addTeam():
	print(request.forms.newTeamName)
	newTeamName = request.forms.newTeamName
	teams[getTechnicalTeamName(newTeamName)] = newTeamName
	persistTeams()

	redirect('/')

def persistTeams():
	with open(teamFileName, 'wb') as f:  # open a text file
		pickle.dump(teams, f) # serialize the list

@get('/deleteTeamName/<target>')
def uglyTeamNameChange(target):
	if getTechnicalTeamName(target) in teams:
		teams.pop(getTechnicalTeamName(target))
		persistTeams()

	if getTechnicalTeamName(target) in scores:
		scores.pop(getTechnicalTeamName(target))
		persistScores()

@get('/changeTeamName/<source>/<target>')
def uglyTeamNameChange(source, target):
	print("uglyTeamNameChange", flush=True)
	print("changing %s(%s) to %s(%s)" % (source, getTechnicalTeamName(source), target, getTechnicalTeamName(target)), flush=True)
	print(getTechnicalTeamName(source) in teams)
	if getTechnicalTeamName(source) in teams:
		if getTechnicalTeamName(source) == getTechnicalTeamName(target):
			teams[getTechnicalTeamName(source)] = target
		else:
			teams[getTechnicalTeamName(target)] = target
			teams.pop(getTechnicalTeamName(source))
		persistTeams()

		print("Echo", flush=True)
		if getTechnicalTeamName(source) in scores:
			print("Setting scores for %s(%s) to those of %s(%s)" % (target, getTechnicalTeamName(target), source, getTechnicalTeamName(source)), flush=True)
			scores[getTechnicalTeamName(target)] = scores[getTechnicalTeamName(source)]
			# scores.pop(getTechnicalTeamName(source))
			persistScores()


@post('/reset')
def reset():
	pass
	# remove pkl files(or backup them) and start from scratch

@post('/scores')
def updateScores():
	for scorePoint in list(request.forms.items()):
		print(scorePoint)
		if(scorePoint[1] != ''):
			print(scorePoint[0].split(scoreDelimiter), scorePoint[1])
			teamName, round = scorePoint[0].split(scoreDelimiter )
			if teamName not in scores:
				scores[teamName] = {}
			scores[teamName][round] = scorePoint[1]
	persistScores()

	redirect('/')

def persistScores():
	with open(scoreFileName, 'wb') as f:  # open a text file
		pickle.dump(scores, f) # serialize the list

	



@get('/')
def redirectToMain():
	return template('main', teams = teams, 
			rounds = [("Ronde 1","ronde_1"), ("Ronde 2","ronde_2")], scores = scores, DELIMITER=scoreDelimiter)#rounds can be gotten from settings, teams need to be managed at runtime
    
templateDir = Path(__file__ + '/../views')
print(templateDir)

TEMPLATE_PATH.insert(0, templateDir)
run(host='0.0.0.0', port=4040, debug=True)