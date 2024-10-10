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

## settings
Generic part where settings that should be shared are placed.
TODO: expand with actual information
```
    "settings": {
        "output_dir": "output"
    }
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
 - NO_QUESTIONS_ONLY: don't show a questions slide, only show answer slides. This is useful if you have a table-round that needs no presentation for the questions, but has the questions on distributed papers. and are done during the course of the quiz. This way you can enter those questions in the question files, but don't show them during the presentation, except for the answers.
 - CATEGORY: extract all the questions with this category from all the questions, and show them in this round.

## caveats
Make sure there are no trailing comma's in the json file.  
This is valid: 
```json
{
	"rounds" : ["Round 1", "Round 2", "ABC"],
	"category_order": [
			"Miscelaneous", "Varia"
	],
    "specs": {
        "ABC": ["NO_CATEGORY_SORT"]
    },
	"input_files": [
        "demo_questions_1.txt",
        "demo_questions_2.txt"
    ]
}
```

This is not: 
```json
{
	"rounds" : ["Round 1", "Round 2"],
	"category_order": [
			"Miscelaneous", "Varia"
	],
	"input_files": [
        "demo_questions_1.txt",
        "demo_questions_2.txt"
    ],
}
```


this isn't either: 
```json
{
	"rounds" : ["Round 1", "Round 2"],
	"category_order": [
			"Miscelaneous", "Varia"
	],
	"input_files": [
        "demo_questions_1.txt",
        "demo_questions_2.txt",
    ]
}
```

# execution
Make a folder for your event on the same level as revealPresenter and converter, and place all required files in there, including any images, sounds, and all question files, as well as the configuration file.
Run the command `python <path_to_converter_folder>/src/converter/convert.py <name_of_the_config_file>`

This will generate all required files, as well as copy a set of kwismaster files to your project folder.
While you can't distribute this folder as-is(yet) due to the dependency on reveal itself, it makes it easier to see what you need to do the day of the event.

By default a round's questions will be sorted by the 'category_order'. If you don't want this behaviour, and just want the questions in the order they appear in the question files, specify a NO_CATEGORY_SORT for the round in the specs part of the configuration eg. ```"specs": {
        "ABC": ["NO_CATEGORY_SORT"]
    }```
# Q & A
## My round is not visible in the presentation!
You probably didn't specify your round in the `rounds` part of `kwismaster.json`

# Tests
## converter
Tests are written using pytest. To execute them just go to the converter folder and run `pytest`. Settings are done through pytest.ini.

## revealPresenter
Specified as .spec file, executed by showing the SpecRunner.html file in the browser.
