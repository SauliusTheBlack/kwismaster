// TODO: fix the end of questions issue
// TODO: fix going too far back



(function(){
  'use strict';  //Create a global variable and expose it to the world
  var $myapp = {};
  self.$myapp = $myapp;

	$myapp.someFunction = function(){
		return "Works";
	};

})();



let currentRound = -1;
let currentQuestion = -1;

function showChapterSlide(){
  currentQuestion = -1;
  
  document.getElementById("chapterSlide").style.display="block";
  document.getElementById("questionSlide").style.display="none";
    
  let textToShow = questions[currentRound]["name"];
  console.log("Showing " + textToShow);
  document.getElementById("chapterContent").innerText = textToShow;
}

function startQuiz(round){
  currentRound = 0;
  showChapterSlide();
}

function showQuestion(currentQuestion){

    document.getElementById("questionContent").innerText = currentQuestion["shortQuestion"];
    
    if(currentQuestion.img){
      var img = document.createElement("img");
      img.src = currentQuestion.img;
      var src = document.getElementById("questionContent");
      src.appendChild(img);
    } else {
      console.log("Just text is fine");
    }

}

function goToNextQuestion(){
  document.getElementById("chapterSlide").style.display="none";
  document.getElementById("questionSlide").style.display="block";
    
  currentQuestion++;
  
  if (currentQuestion < questions[currentRound]["questions"].length ){
    let q = questions[currentRound]["questions"][currentQuestion];
    
    showQuestion(q);
    
    
  } else {
    console.log("No more questions to show");
    currentRound++;
    showChapterSlide();
    
  }
}

function goToPreviousQuestion(){
  console.log(currentQuestion);
  console.log(currentRound);
  
  document.getElementById("chapterSlide").style.display="none";
  document.getElementById("questionSlide").style.display="block";
    
  currentQuestion--;
  
  if (currentQuestion == -1 ){
    showChapterSlide();
  } else {
    if (currentQuestion == -2) {
      if(currentRound > 0){
        currentRound--;
        currentQuestion = questions[currentRound]["questions"].length-1;
      } 
    }
    let q = questions[currentRound]["questions"][currentQuestion];
    showQuestion(q);
  }  
}



window.addEventListener("load", (event) => {
  startQuiz();
});

window.addEventListener("click", (event) => {
  goToNextQuestion();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft"){
    // console.log("Left Arrow was pressed: going back");
    goToPreviousQuestion();
  } else if (e.key === "ArrowRight" || e.key === "Enter") {
    // console.log("Left Arrow was pressed: going forwards");
    goToNextQuestion();
  }
});
