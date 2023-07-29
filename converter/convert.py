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

allQuestions = []
allQuestionsByRoundMap = {}
questions = []

def finaliseQuestion(question):
    allQuestions.append(question)
    
    if question.round.strip() == "":
        print("Question {" + question.shortQuestion + "} has no round assigned to it!")  
        question.round = "Unknown"  
    
    if question.round not in allQuestionsByRoundMap:
        allQuestionsByRoundMap[question.round] = len(questions)
        questions.append({})
        questions[allQuestionsByRoundMap[question.round]]["name"] = question.round
        questions[allQuestionsByRoundMap[question.round]]["questions"] = []
    questions[allQuestionsByRoundMap[question.round]]["questions"].append(question)
    
    
    
        
currentQuestion = None
with open("../vragenEllen.txt",'r') as questionFile:
    for line in questionFile:
        if not ':' in line:
            continue
            
        key, value = line.split(':',1)
        # print(key)
        # print("- " + value)
        if key.lower().strip() == "lange vraag":
            if(currentQuestion):
                finaliseQuestion(currentQuestion)
                
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
            
    finaliseQuestion(currentQuestion)




# this should come from a file
category_order = [
"aardrijkskunde","fauna en flora","geschiedenis","Halloween",
"literatuur","Media","Muziek","sport","Technologie","Wiskunde","Rode Draad"
]


for round in questions:
    round["questions"].sort(key=lambda x: [co.lower() for co in category_order].index(x.category.lower()))
    
    with open("../presenter/presentationText_"+round["name"]+".txt", 'w') as presenterText:
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
    
with open("../presenter/questions.js", "w") as outfile:
    outfile.write("questions = ")
    outfile.write(round_object)
