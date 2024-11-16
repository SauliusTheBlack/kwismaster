from converter.deliverable_creator import copyScoreKeeper, copyPresenter, copyScorePresenter
from converter.util import Settings

import os

def test_theScoreKeeperIsCopied_thenTheRequiredFilesAreDone():
	settings = Settings()
	settings.projectDir = './tmptest'
	settings.sourceDir = '..'

	copyScoreKeeper(settings)

	#flaky / implementation-dependent, but will do for now
	assert os.path.exists("./tmptest/scoreKeeper")
	assert os.path.exists("./tmptest/scoreKeeper/scorekeeper.py")
	assert os.path.exists("./tmptest/scoreKeeper/views/main.tpl")


def test_theScorePresenterIsCopied_thenTheRequiredFilesAreDone():
	settings = Settings()
	settings.projectDir = './tmptest'
	settings.sourceDir = '..'

	copyScorePresenter(title="test scores", settings=settings, rounds=["Round 1, Round 2"])

	#flaky / implementation-dependent, but will do for now
	assert os.path.exists("./tmptest/scoreBoard/scoreboard.css")
	assert os.path.exists("./tmptest/scoreBoard/scoreboard.html")
	assert os.path.exists("./tmptest/scoreBoard/scoreboard.js")
	#todo: check that correct find and replaces are done as well!!