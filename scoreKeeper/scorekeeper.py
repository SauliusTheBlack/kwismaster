# A simple HTTP server that supplies a page to keep the score for the kwismaster application.
# All data is kept in simple files for persistence and ease of adaptation, at the cost of some security


from bottle import get, post, run, template, TEMPLATE_PATH, redirect, app
from requests.exceptions import ConnectTimeout
from pathlib import Path
import sys

scoreDelimiter = "@#DELIM#@"


@get('/')
def redirectToMain():
	knownScoresInFile = ["carebears_ronde_1@#DELIM#@100", "pokemon_ronde_2@#DELIM#@80"]

	knownScores = {}
	for score in knownScoresInFile:
		teamRound, teamRoundScore = score.split(scoreDelimiter )
		knownScores[teamRound] = teamRoundScore

	return template('main', teams = [("Carebears","carebears"),("My Little Pony","my_little_pony"),("Pokemon", "pokemon")], 
			rounds = [("Ronde 1","ronde_1"), ("Ronde 2","ronde_2")], scores = knownScores)#rounds can be gotten from settings
    
templateDir = Path(__file__ + '/../views')
print(templateDir)

TEMPLATE_PATH.insert(0, templateDir)
run(host='0.0.0.0', port=4040, debug=True)