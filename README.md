# Kwismaster
Creating a quiz is great fun. Creating the presentation files less so.
If you need to have a presentation-bundle as well as something to show through a beamer, it gets tedious putting it all into order.
Managing different versions of your questions is equally hard.
With this tool it becomes a whole lot easier.

The tool is made out of several components to 
- convert from plain text to technical file
- use the converted technical file to show the quiz

# The questions
The first part of the process is to create the questions< To make it as low-tech as possible, the layout for this is the following:
```
Lange vraag: Long form of the question, used by the presenter to read during the quiz event itself
Korte vraag: Short form of the question, used by Kwismaster in the presentations for both question and answer slides
Antwoord: The answer. Used in the Answer slides, and in the notes for the presenter.
Afbeelding: the name of an image file. The image needs to reside in the revealPresenter/images folder.
Categorie: The category to which the question belongs. The category is used to order the questions in the rounds, and as a subtitle in the presentation slides.
Ronde: The round in which the question should be asked. Used by the tool to sort the questions into the right order without extra manual interaction.
```

Currently there is no support for other languages in the format of the questions files, but there is an open issue for this on GitHub.
Currently there is no support for media apart from images. There is an open issue for this on GitHub.

There is support for multiple files with questions, so that many persons can work at their leisure(eg from home) and consolidate all the questions later.

Check the section about the configuration file for more information on how to manage the question file(s).

# The configuration file
There is a file `kwismaster.json` that is used for all configuration between the converter and the presenter. In a later stage the scoreboard will also use this file if any relevant settings need to be done.
The file needs to be placed in the kwismaster folder like this:
```
kwismaster
\ kwismaster.json
\ converter
\ reveal
\ revealPresenter
\ revealScore
```

There are several sections to take into consideration:
## rounds
rounds is a list, containing all the rounds that will be presented in the quiz. If the round is not visible, it probably isn't set here!
```
"rounds": [
        "Round 1",
        "Round 2",
		...
        "Round x"
    ],
```
## category_order
This section defines how the questions should be ordered by category in every round.
```
 "category_order": [
        "Math", "Bio", "History", ... , "Red Herring"
    ],
```
## input_files
A list of all the files that will be used to extract questions from. The order or name is irrellevant.
The files need to adhere to the specification as explained in the relevant section about questions.
```
"input_files": [
        "questions1.txt",
        "questions2.txt",
        ...
        "questionsX.txt"
    ],
```
## specs
For any given round there are settings that are possible
```
"specs": {
        "Round 1": ["NO_CATEGORY_SORT"],
        "Red Herring": ["NO_CATEGORY_SORT", "NO_QUESTIONS_ONLY", "CATEGORY:Red Herring"]
    }
```
 - NO_CATEGORY_SORT: don't sort this round by category. This is useful if you have a round where there is only 1 category(see the CATEGORY: spec) or a category that does not appear in any other round.
 - NO_QUESTIONS_ONLY: don't show a questions slide, only show answer slides. This is useful if you have a table-round that needs no presentation for the questionsm but has the questions on distributed papers. and are done during the course of the quiz. This way you can enter those questions in the question files, but don't show them during the presentation, except for the answers.
 - CATEGORY: extract all the questions with this category from all the questions, and show them in this round.

## execution
While a .exe is in the works for Windows, the following commands will work for all platforms that support python.
### Creating the question.js
The following command is an example, executed from kwismaster/converter.  
It needs python 3.7+ to be installed and added to Path.
```python src/converter/convert.py ../test/kwismaster_singleInputFile.json```
This should generate a questions.js file in the main folder.  
Adapt as you see fit.

From revealPresenter, run the kwismaster.html file to see the generated presentation.
# Q & A
## My round is not visible in the presentation!
You probably didn't specify your round in the `rounds` part of `kwismaster.json`