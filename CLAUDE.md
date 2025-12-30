# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kwismaster is a quiz presentation tool that converts plain-text question files into interactive presentations. The system consists of three main components:

1. **Converter** (Python) - Parses question files and generates presentation files
2. **RevealPresenter** (JavaScript) - Displays quiz questions and answers using reveal.js
3. **ScoreKeeper** (Python/Bottle) - Web server for managing team scores during quiz events

## Architecture

### Data Flow
1. User creates question files in plain text format (Dutch or English)
2. User creates a JSON configuration file specifying rounds, categories, and input files
3. Converter (`convert.py`) processes question files and outputs:
   - `questions.js` - JavaScript object containing all questions organized by round
   - `settings.js` - Configuration settings
   - Presentation text files for each round
   - Correction key files for each round
4. Converter copies presenter and scorekeeper files to project directory
5. RevealPresenter displays questions/answers via `kwismaster.html`
6. ScoreKeeper provides HTTP API at port 4040 for score management

### Key Path Logic
- **sourceDir**: Two levels up from the config file location (`config_file/../../`)
- **projectDir**: Directory containing the config file
- **baseInOutDir**: Defaults to projectDir, can be overridden with `settings.output_dir` in config

The converter copies files from:
- `sourceDir/revealPresenter` → `projectDir/presenter`
- `sourceDir/scoreKeeper` → `projectDir/scoreKeeper`
- `sourceDir/reveal` → `projectDir/reveal`

## Common Commands

### Testing
```bash
# Run converter tests with coverage
cd converter
pytest

# Run presenter tests
# Open revealPresenter/SpecRunner.html in browser (uses Jasmine)
```

### Building
```bash
# Build converter executable with PyInstaller
cd converter/src/converter
pyinstaller convert.spec
# Output: converter/src/converter/dist/convert/convert.exe
```

### Running
```bash
# Run converter on a quiz project
python converter/src/converter/convert.py <path_to_config_file>/config.json

# Example:
python converter/src/converter/convert.py quiz_demo/demo_configuration.json

# Run scorekeeper server
cd <quiz_project>/scoreKeeper
python scorekeeper.py
# Server runs on http://0.0.0.0:4040
```

## Configuration File Format

The JSON configuration file (`kwismaster.json` or similar) must contain:
- `rounds`: List of round names in display order
- `category_order`: Order for sorting questions within rounds
- `input_files`: List of question file names (relative to project directory)
- `title`: Quiz title used in HTML pages
- `settings.output_dir` (optional): Output subdirectory within project
- `specs` (optional): Per-round specifications
  - `NO_CATEGORY_SORT`: Don't sort by category
  - `NO_QUESTIONS_ONLY`: Skip question slides, only show answers
  - `CATEGORY:<name>`: Extract all questions with this category into this round

**Important**: JSON must not have trailing commas.

## Question File Format

Question files use a keyword-based format. The converter auto-detects language from the first line:
- Dutch: Starts with "Lange vraag" (case-insensitive)
- English: Starts with "Long question" (case-insensitive)

### Keywords (Dutch/English):
- Lange Vraag / Long Question: Full question text (for presenter notes)
- Korte Vraag / Short Question: Brief question (displayed on slides)
- Antwoord / Answer: The answer
- Afbeelding / Image: Image filename (from `images/` folder)
- Geluid / Sound: Sound filename (from `sounds/` folder)
- Categorie / Category: Question category
- Ronde / Round: Round name

Multi-line values are supported - continue writing on the next line without a keyword.

## Module Organization

### converter/src/converter/
- `convert.py`: Main entry point, orchestrates the conversion process
- `question_parser.py`: Parses question files into Question objects
- `file_creator.py`: Creates presentation text and correction key files
- `deliverable_creator.py`: Copies presenter/scorekeeper files to project directory
- `translations.py`: Keyword translations for Dutch/English support
- `util.py`: Settings class for configuration validation

### revealPresenter/
- `kwismaster.js`: Generates reveal.js slides from questions.js
- `kwismaster.html`: Main presentation HTML (template with placeholders)
- `SpecRunner.html`: Jasmine test runner
- `spec/kwisSpec.js`: JavaScript unit tests

### scoreKeeper/
- `scorekeeper.py`: Bottle web server providing score management API
- `views/main.tpl`: HTML template for score entry interface
- Uses pickle files for persistence: `scores.pkl`, `teams.pkl`
- Reads `rounds.txt` from parent directory for round configuration

### revealScore/ (Scoreboard Display)
- `scoreboard.html`: Reveal.js-based score display template
- `scoreboard.js`: Score rendering with dynamic pagination and async API calls
- `scoreboard.css`: Responsive styling for tables and layout
- **Key features**:
  - Dynamic pagination: Calculates teams-per-slide based on viewport height (5-20 teams)
  - Responsive design: Breakpoints at 1600px, 1200px, 900px
  - Auto-sizing columns: First column fits to longest team name
  - Async fetch API: Modern error handling with retry logic
  - Error states: Handles scoreKeeper offline and empty scores gracefully
  - Sorted display: Teams sorted by total score (alphabetical on ties)

## Testing Notes

### Python Tests (pytest)
- Configuration in `converter/pytest.ini`
- Coverage reports output to `converter_coverage/`
- Tests use `pythonpath = . src src/converter` to import from `converter` package

### JavaScript Tests (Jasmine)
- Spec files in `revealPresenter/spec/`
- Run by opening `SpecRunner.html` in browser
- Uses Jasmine 5.1.1

## Project Structure Patterns

Quiz projects are created in folders like `quiz_demo/`, `quiz_traddans_nov_2025/`, etc. Each contains:
- Question text files
- Configuration JSON
- `images/` folder with question images
- After conversion: `presenter/`, `scoreKeeper/`, `reveal/`, `scoreboard/` folders

The `reveal/` folder is a copy of the reveal.js library used for presentations.

## Image Handling

Images are referenced without extensions in question files. The presenter JavaScript (`kwismaster.js`) automatically tries multiple extensions: jpg, jpeg, png (case-insensitive) to find the correct file.

Image syntax supports ratio specification: `imagename.jpg:2` scales the image height by factor of 2.

## Sound Handling

Sound files support start time specification: `sound.mp3[1:30]` starts playback at 1 minute 30 seconds.

## Special Round Handling

The code contains hardcoded logic for a round called "Rode Draad" (Red Thread):
- `kwismaster.js:219-223`: Filters this category from answer slides in other rounds
- This should ideally be configuration-driven but currently is not

## Known Issues

- The sourceDir calculation (`configFile + "\\..\\.."`in convert.py:69) is hardcoded and marked as high-priority TODO
- Template placeholders in HTML files use `@VARIABLE@` format
- Windows path separators (`\\`) used throughout converter code
- No validation for missing rounds in configuration vs question files (warns but continues)

## Development Notes

- Quiz output folders (quiz_*, distTest/) contain generated files and typically don't need inspection unless specifically requested
- The codebase has three logical subprojects: revealPresenter, revealScore, and scoreKeeper
- When working with question files, remember language detection is based on the first line keyword (case-insensitive)
- Event project folders should be created at the same level as revealPresenter and converter directories