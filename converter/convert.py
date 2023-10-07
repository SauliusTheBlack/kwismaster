from json import JSONEncoder

# this makes classes serialisable
class MyEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__   

class Question:
    def __init__(self):
        pass
        
    def setLongQuestion(self, txt):
        self.longQuestion = txt.strip()
        
    def setShortQuestion(self, txt):
        self.shortQuestion = txt.strip()
        
    def setAnswer(self, txt):
        self.answer = txt.strip()
        
    def setImg(self, txt):
        self.img = txt.strip()
        
    def setCategory(self, txt):
        self.category = txt.strip()
        
    def setRound(self, txt):
        self.round = txt.strip()

    def __repr__(self) -> str:
        return self.round + " - " + self.shortQuestion

allQuestions = []
allQuestionsByRoundMap = {}

            

baseInOutDir = "C:/Users/peter/Projects/kwismaster/" 
outDir =    baseInOutDir + "/revealPresenter" 
outFilename = outDir + "/questions.js"
# inFileName =  "vragenBeperkt.txt"
#inFileName =  "vragen.txt"

infiles = ["vragenVeerle.txt", "vragenEva.txt", "vragenRodeDraad.txt"
        #    "vragenEllen.txt", "vragenSara.txt", "vragenHilde.txt",
             ]


def readSingleFile(filename):
    print("Reading " + filename)
    currentQuestion = None
    with open(baseInOutDir+filename ,'r', encoding='utf-8') as questionFile:
        for line in questionFile:
            if not ':' in line:
                continue            
            key, value = line.split(':',1)
            if key.lower().strip() == "rondes":
                for round in value.split(","):
                    allQuestionsByRoundMap[round.strip()] = []
                continue

            if key.lower().strip() == "lange vraag":
                if(currentQuestion):
                    allQuestions.append(currentQuestion)                
                currentQuestion = Question()
                currentQuestion.setLongQuestion(value)
            elif key.lower().strip() == "korte vraag":
                currentQuestion.setShortQuestion(value)
            elif key.lower().strip() == "antwoord":
                currentQuestion.setAnswer(value)
            elif key.lower().strip() == "afbeelding":
                currentQuestion.setImg(value)
            elif key.lower().strip() == "categorie":
                currentQuestion.setCategory(value)
            elif key.lower().strip() == "ronde":
                currentQuestion.setRound(value)
            else:
                print(f"Skipping line {line}")
        allQuestions.append(currentQuestion)

for fileName in infiles:
    readSingleFile(fileName)


# this should come from a file
category_order = [
"aardrijkskunde","fauna en flora","geschiedenis","Halloween",
"kunst, cultuur en literatuur","Media","Muziek","sport","techniek en technologie","Wiskunde","Rode Draad"
]

allQuestions.sort(key=lambda question: question.round.lower())

questions = []
currentRound = None
currentRoundName = ""
currentRoundQuestions = []
for question in allQuestions:
    if currentRoundName != question.round.strip().lower():
        if(currentRound != None):
            currentRound["name"] = currentRoundName.capitalize()
            currentRound["questions"] = currentRoundQuestions
            questions.append(currentRound)
            currentRoundQuestions = []
        currentRound = {}
        currentRoundName = question.round.strip().lower()
    currentRoundQuestions.append(question)

currentRound["name"] = currentRoundName.capitalize()
currentRound["questions"] = currentRoundQuestions
questions.append(currentRound)

# [{name,questions},{}]
for round in questions:
    round["questions"].sort(key=lambda x: [co.lower() for co in category_order].index(x.category.lower()))
    
    with open(outDir + "/presentationText_"+round["name"]+".txt", 'w') as presenterText:
        presenterText.write(round["name"] + "\n")
        for questionNumber, question in enumerate(round["questions"]):
            presenterText.write(str(questionNumber + 1) + ": " + question.longQuestion + "\n\n")
        
        presenterText.write("\n\nAntwoorden!!\n\n\n")
        # Exclude Rode Draad from answersheet?
        for questionNumber, question in enumerate(round["questions"]):
            presenterText.write(str(questionNumber + 1) + ": " + question.shortQuestion + "\n")
            presenterText.write("\t - " + question.answer + "\n\n")
        
import json
json_object = json.dumps(allQuestions, indent=4, cls=MyEncoder)
round_object = json.dumps(questions, indent=4, cls=MyEncoder)
# Writing to sample.json
with open("sample.json", "w") as outfile:
    outfile.write(json_object)

with open(outFilename, "w") as outfile:
    print(f'writing to {outFilename}')
    outfile.write("questions = ")
    outfile.write(round_object)
