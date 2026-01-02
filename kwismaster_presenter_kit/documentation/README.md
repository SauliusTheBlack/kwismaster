# Kwismaster All-in-One Kit

This is a complete, self-contained kit for creating, presenting, and scoring quizzes. It includes the Question Editor, Presenter, and Scorekeeper in one folder.

## What's Inside

```
kwismaster_presenter_kit/
├── VERSION              # Kit version number
├── README.md           # This file
├── editor.html         # Question Editor - CREATE QUESTIONS HERE
├── presenter.html      # Presenter - PRESENT YOUR QUIZ HERE
├── scorekeeper.html    # Scorekeeper - TRACK TEAM SCORES HERE
├── quiz_data.js       # Quiz data file (exported from editor)
├── user_data/         # Your media files
│   ├── images/        # Put your quiz images here
│   └── sounds/        # Put your quiz sounds here
└── lib/               # Library files (don't modify)
    ├── presenter/
    │   ├── js/
    │   ├── css/
    │   └── reveal/    # Reveal.js library
    ├── questionEditor/
    │   ├── js/
    │   └── css/
    └── scorekeeper/
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

#### Step 4: Keep Score (Optional)

1. **Open the scorekeeper:**
   - Double-click `scorekeeper.html` in the kit folder
   - It will open in your default web browser
   - The scorekeeper automatically reads rounds from your `quiz_data.js` file

2. **Manage teams:**
   - Enter team names manually or use **Quick Add** to auto-generate names
   - Teams are saved automatically in your browser

3. **Track scores:**
   - Use the **Overview** tab to see all scores at once
   - Use individual round tabs to enter scores per round
   - Totals are calculated automatically
   - All scores are saved automatically in your browser

4. **Export/Import scores:**
   - Click **Export Scores** to download scores as a JSON file
   - Click **Import Scores** to load previously saved scores
   - Use **Reset All Scores** to clear all data and start fresh

#### Step 5: Present Your Quiz

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

## Scorekeeper Features

### Automatic Persistence
All team names and scores are automatically saved to your browser's localStorage. You can close the scorekeeper and reopen it anytime - your data will still be there.

### Network Sync (Two-Laptop Setup)
The scorekeeper supports a **two-laptop setup** where:
- **Display Laptop** (presenting station) - Shows scores in real-time, read-only
- **Entry Laptop** (correction station) - Where you enter scores

Scores sync in real-time over your local network using WebRTC peer-to-peer connections (no server needed!).

#### How to Set Up Network Sync

**On the Presenting Laptop:**
1. Open `scorekeeper.html`
2. Click **"⚡ Setup Network Sync"**
3. Choose **"📺 Display Mode (Presenting Laptop)"**
4. A connection code will appear - copy it

**On the Correction Station Laptop:**
1. Open `scorekeeper.html`
2. Click **"⚡ Setup Network Sync"**
3. Choose **"✏️ Entry Mode (Correction Station)"**
4. Paste the connection code from the presenting laptop
5. An answer code will appear - copy it

**Back on the Presenting Laptop:**
1. Paste the answer code
2. Click **"Connect"**

Both laptops are now connected! Scores entered on the correction station will appear instantly on the presenting laptop.

#### Network Sync Requirements
- Both laptops must be on the same local network (WiFi or Ethernet)
- Both laptops must have an internet connection initially (for WebRTC STUN servers)
- Once connected, they communicate directly peer-to-peer
- Connection codes are single-use - you'll need new codes if you disconnect

#### Troubleshooting Network Sync
- If connection fails, make sure both laptops can access the internet
- Firewalls or corporate networks may block WebRTC connections
- If stuck, try disconnecting and setting up again with new codes
- As a fallback, you can always use Export/Import to manually transfer scores

### Data Portability
- **Export**: Download your scores as a JSON file to back them up or share with others
- **Import**: Load scores from a previous export to continue scoring or review results
- **Multi-Device**: Export from one computer and import on another (manual alternative to Network Sync)

### Important Notes
- Each browser stores its own data - Chrome and Firefox will have separate scorekeeper data
- Clearing your browser data will delete stored teams and scores (export first!)
- The scorekeeper automatically syncs with your `quiz_data.js` file for round names
- In Display Mode, score editing is disabled - only the Entry Mode laptop can change scores

## Troubleshooting

**Q: The presentation shows "Quiz Presentation" with one sample question**
A: You haven't replaced the `quiz_data.js` file yet. Export from the Question Editor and replace it.

**Q: The scorekeeper doesn't show my rounds**
A: Make sure you've exported your quiz data from the editor and replaced the `quiz_data.js` file in the kit folder.

**Q: My scores disappeared**
A: Check if you're using the same browser. If you cleared browser data, your scores were deleted. Always export important scores as backup.

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
