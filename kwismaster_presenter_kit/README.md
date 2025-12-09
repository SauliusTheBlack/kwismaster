# Kwismaster All-in-One Kit

This is a complete, self-contained kit for creating and presenting quizzes. It includes both the Question Editor and the Presenter in one folder.

## What's Inside

```
kwismaster_presenter_kit/
├── VERSION              # Kit version number
├── README.md           # This file
├── editor.html         # Question Editor - CREATE QUESTIONS HERE
├── presenter.html      # Presenter - PRESENT YOUR QUIZ HERE
├── quiz_data.js       # Quiz data file (exported from editor)
├── user_data/         # Your media files
│   ├── images/        # Put your quiz images here
│   └── sounds/        # Put your quiz sounds here
└── lib/               # Library files (don't modify)
    ├── presenter/
    │   ├── js/
    │   ├── css/
    │   └── reveal/    # Reveal.js library
    └── questionEditor/
        ├── js/
        └── css/
```

## How to Use

### First Time Setup

1. Download or copy this entire `kwismaster_presenter_kit` folder to your computer
2. That's it! You're ready to go.

### Complete Workflow

#### Step 1: Create Your Questions

1. **Open the Question Editor:**
   - Double-click `editor.html` in the kit folder
   - It will open in your default web browser

2. **Create an event:**
   - Click "+ New Event" and give your quiz a name
   - Everything you create will be saved to this event

3. **Add your questions:**
   - Click "+ Add Question" to create questions
   - Fill in the question text, answer, round, and category
   - Repeat for all your questions

4. **Configure settings (optional):**
   - Click "⚙ Settings" to configure:
     - Quiz title
     - Round order (drag and drop)
     - Category order
     - Round specifications (NO_CATEGORY_SORT, NO_QUESTIONS_ONLY, etc.)

#### Step 2: Export Your Quiz

1. **Export quiz data:**
   - In the editor, click **"Export Quiz Data"**
   - This downloads a file called `quiz_data.js`
   - The file will be in your Downloads folder

2. **Replace the quiz data:**
   - Copy the downloaded `quiz_data.js` file
   - Paste it into this `kwismaster_presenter_kit` folder (same folder as editor.html)
   - Replace the existing `quiz_data.js` file when prompted

#### Step 3: Add Media (if needed)

1. **Add images:**
   - Copy any image files to the `user_data/images/` folder
   - Make sure filenames match what you entered in the Question Editor

2. **Add sounds:**
   - Copy any sound files to the `user_data/sounds/` folder
   - Make sure filenames match what you entered in the Question Editor

#### Step 4: Present Your Quiz

1. **Open the presenter:**
   - Double-click `presenter.html` in the kit folder
   - It will open in your default web browser

2. **Navigate the presentation:**
   - Use **arrow keys** or **space bar** to move through slides
   - Press **S** to open speaker notes (shows long questions)
   - Press **F** for fullscreen mode
   - Press **ESC** to exit fullscreen
   - Press **B** or **.** to pause/blackout the screen

## Presentation Controls

- **Arrow Keys** or **Space**: Navigate through slides
- **S**: Open speaker notes window (shows long questions)
- **F**: Enter fullscreen mode
- **ESC**: Exit fullscreen or overview mode
- **O**: Toggle overview mode (see all slides)
- **B** or **.**: Pause/blackout the screen

## File Format Details

### quiz_data.js Format

The `quiz_data.js` file contains two JavaScript variables:

```javascript
var questions = [
    {
        "name": "Round 1",
        "questions": [
            {
                "longQuestion": "Full question text...",
                "shortQuestion": "Brief question for slides",
                "answer": "The answer",
                "category": "Category Name",
                "img": "image.jpg",
                "sound": "sound.mp3",
                "round": "Round 1"
            }
        ]
    }
];

var settings = {
    "specs": {
        "Round Name": ["NO_QUESTIONS_ONLY"],
        "Another Round": ["NO_CATEGORY_SORT"]
    }
};
```

### Image Filenames

- Images should be placed in the `user_data/images/` folder
- Reference them in questions without the path: `"img": "myimage.jpg"`
- The presenter will automatically try different extensions (jpg, jpeg, png) if not specified

### Sound Filenames

- Sounds should be placed in the `user_data/sounds/` folder
- Reference them in questions without the path: `"sound": "mysound.mp3"`
- You can specify start times: `"sound": "mysound.mp3[1:30]"` (starts at 1 minute 30 seconds)

## Troubleshooting

**Q: The presentation shows "Quiz Presentation" with one sample question**
A: You haven't replaced the `quiz_data.js` file yet. Export from the Question Editor and replace it.

**Q: Images don't show up**
A: Make sure image files are in the `user_data/images/` folder and the filenames match exactly (case-sensitive).

**Q: The page is blank**
A: Check your browser's developer console (F12) for errors. Make sure `quiz_data.js` has valid JavaScript syntax.

**Q: Can I change the title?**
A: Yes, edit `presenter.html` and change the `<title>` tag and the first `<section>` content.

**Q: Can I customize the theme?**
A: Yes, in `presenter.html` change the line:
   `<link rel="stylesheet" href="reveal/dist/theme/beige.css">`
   Available themes: beige, black, blood, league, moon, night, serif, simple, sky, solarized, white

## Advanced: Specifications

The `settings.specs` object controls special behaviors per round:

- **`NO_QUESTIONS_ONLY`**: Skip question slides, only show answer slides
- **`NO_CATEGORY_SORT`**: Don't sort questions by category, keep original order
- **`CATEGORY:Name`**: Extract all questions with category "Name" into this round

Example:
```javascript
var settings = {
    "specs": {
        "Final Round": ["NO_QUESTIONS_ONLY"],
        "Random Round": ["NO_CATEGORY_SORT"]
    }
};
```

## Need Help?

Refer to the main Kwismaster documentation or the Question Editor README for more information.

---

Happy presenting! 🎉
