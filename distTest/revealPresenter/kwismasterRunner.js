window.addEventListener("load", (event) => {
    domQuestions();

    const allAudioElements = document.querySelectorAll('audio');

    // Loop through each audio element and add an event listener
    allAudioElements.forEach(audioElement => {
        audioElement.addEventListener('play', function(event) {
            // Get the specific audio element that triggered the event
            const clickedAudio = event.target;

            // Get the data-start-time attribute from the clicked audio element
            const startTime = parseFloat(clickedAudio.dataset.startTime);

            // Set the audio's currentTime if the start time is defined
            if (startTime && clickedAudio.currentTime < startTime) {
                clickedAudio.currentTime = startTime;
            }
        });
    });
});