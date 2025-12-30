// Quiz Data Loader
// This script provides the loadKwonData() function that quiz_data.js calls
// It converts KWON format data into the format expected by the presenter

var questions = [];
var settings = {};

function loadKwonData(kwonData) {
    try {
        if (!kwonData.questions || !Array.isArray(kwonData.questions)) {
            throw new Error('Invalid .kwon file: missing questions array');
        }

        // Build settings from kwonData if available
        settings = {
            specs: {}
        };

        // Group questions by round
        const questionsByRound = {};
        const rounds = kwonData.rounds || [];
        const categories = kwonData.categories || [];

        rounds.forEach(round => {
            questionsByRound[round] = [];
        });

        kwonData.questions.forEach(q => {
            if (q.round && questionsByRound.hasOwnProperty(q.round)) {
                questionsByRound[q.round].push(q);
            }
        });

        // Sort questions within each round by category order
        rounds.forEach(round => {
            const roundQuestions = questionsByRound[round];

            if (roundQuestions.length > 0) {
                roundQuestions.sort((a, b) => {
                    const aIndex = categories.indexOf(a.category);
                    const bIndex = categories.indexOf(b.category);

                    const aPos = aIndex === -1 ? 9999 : aIndex;
                    const bPos = bIndex === -1 ? 9999 : bIndex;

                    return aPos - bPos;
                });
            }
        });

        // Build questions array in presenter format
        questions = [];
        rounds.forEach(round => {
            const roundQuestions = questionsByRound[round];

            if (roundQuestions.length > 0) {
                questions.push({
                    name: round,
                    questions: roundQuestions.map(q => ({
                        longQuestion: q.longQuestion || '',
                        shortQuestion: q.shortQuestion || '',
                        answer: q.answer || '',
                        category: q.category || '',
                        img: q.img || '',
                        sound: q.sound || '',
                        round: round
                    }))
                });
            }
        });

        console.log('Quiz data loaded successfully');
        console.log(`Event: ${kwonData.event || 'Unknown'}`);
        console.log(`Questions: ${kwonData.questions.length}`);
        console.log(`Rounds: ${rounds.length}`);

        // Store event name for later use
        if (kwonData.event) {
            window.quizEventName = kwonData.event;
        }

        // Update the title slide with event name (do this after DOM is ready)
        function updateTitleSlide() {
            const titleSlide = document.querySelector('#slides section');
            if (titleSlide && kwonData.event) {
                titleSlide.textContent = kwonData.event;
                console.log('Title slide updated to:', kwonData.event);
            }

            // Also update the page title
            if (kwonData.event) {
                document.title = kwonData.event;
            }
        }

        // Try to update immediately if DOM is ready, otherwise wait
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateTitleSlide);
        } else {
            updateTitleSlide();
        }

        // Trigger presentation initialization
        if (window.domQuestions) {
            domQuestions();
        }

    } catch (error) {
        console.error('Error loading quiz data:', error);
        alert('Error loading quiz data: ' + error.message);

        // Set empty defaults so presenter doesn't crash
        questions = [];
        settings = { specs: {} };
    }
}

// No additional initialization needed
// quiz_data.js will call loadKwonData() when it loads
