# A simple HTTP server that supplies a page to keep the score for the kwismaster application.
# All data is kept in simple files for persistence and ease of adaptation, at the cost of some security


from bottle import get, post, run, template, TEMPLATE_PATH, redirect, app, request
from requests.exceptions import ConnectTimeout
from pathlib import Path
import os, pickle

scoreDelimiter = "@##@"
scoreFileName = "scores.pkl"

scores = {}
if os.path.exists(scoreFileName):
	with open(scoreFileName, 'rb') as rf:
		scores = pickle.load(rf)

teams = {
	"carebears": "Carebears",
	"my_little_pony" : "My Little Pony",
	"pokemon": "Pokémon"
}

@post('/teams')
def addTeam():
	print(request.forms.newTeamName)
	newTeamName = request.forms.newTeamName
	teams[newTeamName.lower().replace(" ","_")] = newTeamName
	# with open(scoreFileName, 'wb') as f:  # open a text file
	# 	pickle.dump(scores, f) # serialize the list

	redirect('/')


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

	with open(scoreFileName, 'wb') as f:  # open a text file
		pickle.dump(scores, f) # serialize the list

	redirect('/')



@get('/')
def redirectToMain():
	return template('main', teams = teams, 
			rounds = [("Ronde 1","ronde_1"), ("Ronde 2","ronde_2")], scores = scores, DELIMITER=scoreDelimiter)#rounds can be gotten from settings, teams need to be managed at runtime
    
templateDir = Path(__file__ + '/../views')
print(templateDir)

TEMPLATE_PATH.insert(0, templateDir)
run(host='0.0.0.0', port=4040, debug=True)