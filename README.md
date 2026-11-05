# Next Station: Budapest

A browser-based, single-player puzzle game: build Budapest's four metro lines on a station grid and score points by covering districts, crossing the Danube and creating interchanges. It is written in vanilla JavaScript, renders the board in SVG and needs no build step.

Built as a university project at ELTE Faculty of Informatics (Web Programming, autumn semester 2025/26). Graded 20/20.

**Play online:** this is a static site, so it can be hosted on GitHub Pages (for example `https://toroktomi.github.io/budapest-metro-game/`). See [Deploying to GitHub Pages](#deploying-to-github-pages).

<!-- Screenshot: add docs/screenshot.png and reference it here -->

## Features

- **Start menu** with player name input and a separate rules page.
- **SVG game board**: a grid of stations loaded from JSON, each marked with a type letter (A–D or `?`), a train-station marker and its side of the Danube (Buda or Pest). The river is drawn across the board.
- **Four rounds, one per metro line** (M1, M2, M3, M4) in a random order. Each round has 8 card turns using a shuffled 10-card deck (A, B, C, D and joker, twice each).
- **Rule-checked line building**:
  - The first segment must start at the line's starting station, and later segments extend either end of the line.
  - The target station must match the current card. A joker card or a joker station matches any type.
  - Segments must be horizontal, vertical or 45° diagonal and may not pass through another station.
  - Segments may not cross existing segments, may not revisit a station on the same line, and may not run parallel to a segment from any round.
  - Valid target stations are highlighted after the player selects a line end.
- **Scoring**:
  - Round score: (districts touched × most stations in one district) + Danube crossings.
  - Bonus for connected train stations on a sliding scale, shown on a live tracker.
  - Bonus for interchange stations: 2, 5 or 9 points for stations shared by 2, 3 or 4 lines.
- **HUD** showing the player name, elapsed time, total score, per-round scores, the current card and turn, and indicators for the round order.
- **New game** button when the game ends. The final breakdown, including the bonuses, is written to the browser console.

## Tech stack

- HTML5, CSS3
- Vanilla JavaScript (ES modules, Fetch API, DOM and SVG manipulation)
- JSON data files for stations and lines

## How to run

The game loads its data with `fetch()` and uses ES modules, so it must be served over HTTP. Opening `index.html` directly from the file system will not work.

```bash
git clone https://github.com/toroktomi/budapest-metro-game.git
cd budapest-metro-game
python3 -m http.server 8000
```

Then open http://localhost:8000. Any static file server works, for example the VS Code Live Server extension or `npx serve`.

### Deploying to GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, then choose the `main` branch and the `/ (root)` folder.
3. The game will be published at `https://<username>.github.io/budapest-metro-game/`.

All asset and data paths are relative, so the game also works under the repository sub-path.

## Project structure

```
index.html              Start menu (player name, start, rules)
game.html               Game screen
rules.html              Rules and scoring explanation
css/                    Styles for the menu, game and rules pages
data/stations.json      Station grid: position, type, train flag, Buda/Pest side, district
data/lines.json         Metro lines: name, color, starting station
js/main.js              Game state, rounds and turns, scoring, end of game
js/game.js              Click handling, move validation, valid-move highlighting
js/connectsManager.js   Direction and "no station in between" checks, drawing segments
js/stationsManager.js   Loading JSON data, rendering stations
js/gameinit.js          SVG board, grid and river setup
js/cardManager.js       Deck shuffling and drawing
js/timer.js             Game timer
js/menu.js, js/playerNameGetter.js   Menu navigation, passing the player name in the URL
```

## What I learned / key challenges

- Validating moves geometrically: checking for straight or 45° segments, for stations between the endpoints and for segment–segment intersections on an SVG coordinate system.
- Keeping the game state (rounds, turns, current line, segments of every line) consistent across user interactions in plain JavaScript modules, without a framework.
- Turning a multi-part scoring system (districts, Danube crossings, train-station scale, interchange bonuses) into small, testable calculations.

## Author

Török Tamás
