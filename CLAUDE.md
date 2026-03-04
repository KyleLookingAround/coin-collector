# CLAUDE.md — Coin Collector

This document provides context for AI assistants working on this repository.

## Project Overview

**Coin Collector** is a single-file incremental/idle clicker game (Cookie Clicker-style) built with vanilla HTML, CSS, and JavaScript. The entire application lives in one file: `index.html`.

- **Language**: Vanilla JavaScript, HTML5, CSS3
- **Dependencies**: None — zero external libraries or frameworks
- **Build process**: None — open `index.html` directly in any modern browser
- **Tests**: None — no test framework or test files exist

## Repository Structure

```
coin-collector/
└── index.html    # Entire application (518 lines)
```

There are no subdirectories, no `package.json`, no configuration files, and no CI/CD pipelines.

## Architecture

`index.html` is divided into three sections:

| Section | Lines (approx.) | Purpose |
|---------|-----------------|---------|
| HTML    | 1–137, 518      | UI structure — buttons, display areas, achievement list |
| CSS     | 7–72            | Embedded styles, mobile-first responsive layout |
| JS      | 138–517         | Full game logic, persistence, event handling |

All JavaScript runs in global scope with `let`-declared variables at the top of the script block.

## Game Systems

### State Variables (global)
| Variable | Type | Purpose |
|----------|------|---------|
| `coins` | number | Current coin balance |
| `coinsPerClick` | number | Base value per click |
| `coinsPerSecond` | number | Passive income rate |
| `totalCoinsCollected` | number | Lifetime coins (for achievements) |
| `prestigePoints` | number | Prestige multiplier source |
| `miniGameWins` | number | Coin-flip wins (for "Risk Taker" achievement) |
| `autoCollectorOwned`, `doubleCoinsOwned`, etc. | boolean | Upgrade ownership flags |

### Upgrades (4 total)
| Upgrade | Cost | Effect |
|---------|------|--------|
| Auto Collector | 50 | +1 coin/second |
| Double Coins | 100 | 2× click multiplier |
| Super Auto Collector | 500 | +5 coins/second |
| Triple Coins | 1000 | 3× click multiplier |

### Achievements (10 total)
Each unlocked achievement adds +1% to all coin production. Achievements persist across prestiges.

| Achievement | Condition |
|-------------|-----------|
| First Click | Any click |
| Getting Started | 10 total coins |
| Collector | 100 total coins |
| Investor | Own Auto Collector |
| Wealthy | 1,000 total coins |
| Super Collector | 10,000 total coins |
| Triple Threat | Own Triple Coins upgrade |
| Prestigious | Prestige at least once |
| Millionaire | 1,000,000 total coins |
| Risk Taker | Win 5 coin-flip mini-games |

### Prestige System
- Requires ≥ 10,000 coins to prestige
- Grants 1 prestige point per 10,000 coins held
- Each prestige point adds +10% to all production (stacking)
- Resets: coins, upgrades, `coinsPerClick`, `coinsPerSecond`
- Preserves: achievements, prestige points

### Multiplier Formula
```
totalMultiplier = (1 + prestigePoints * 0.10) * (1 + achievementsUnlocked * 0.01)
```

### Mini-Game: Coin Flip
- Player wagers coins on heads or tails
- 50% probability each side
- Win: doubles the wager; Lose: loses the wager

### Persistence
- Auto-save to `localStorage` every 30 seconds
- Manual save/load via UI buttons
- Save key: `coinCollectorSave` (JSON serialized state)

## Key Functions

| Function | Purpose |
|----------|---------|
| `updateCoinCount()` | Refreshes all UI display elements |
| `getTotalMultiplier()` | Computes combined prestige + achievement multiplier |
| `startCoinProduction()` | Sets up 1-second interval for passive income |
| `checkAchievements()` | Evaluates all achievement conditions and unlocks |
| `displayAchievement(name)` | Shows achievement toast notification |
| `playCoinFlip()` | Executes mini-game logic |
| `resetGame()` | Prestige reset — clears progress, grants prestige points |
| `saveGame()` / `loadGame()` | localStorage persistence |

## Code Conventions

- **Variables**: `camelCase` (e.g., `coinsPerClick`, `autoCollectorOwned`)
- **Functions**: `camelCase` (e.g., `updateCoinCount`, `startCoinProduction`)
- **DOM targeting**: IDs (e.g., `document.getElementById('coinCount')`)
- **Event binding**: `addEventListener` — no inline `onclick` attributes
- **Scope**: All game state lives in global `let` variables at the top of the script
- **Styling**: All CSS embedded in `<style>` within `<head>`; mobile-first with a 600px breakpoint
- **No linting or formatting tools** — follow the existing indentation style (2-space indent inside `<style>` and `<script>`, 4-space for JS logic)

## Development Workflow

### Running the App
Open `index.html` directly in a browser — no server, no build step needed.

### Making Changes
1. Edit `index.html` directly
2. Refresh the browser to test
3. Use browser DevTools console to debug JavaScript

### Git Workflow
- Default branch: `master`
- Feature branches follow the convention: `claude/<description>-<id>`
- Commit messages should be short and descriptive
- No PR templates or contribution guidelines exist

### What Does Not Exist (don't add without discussion)
- Build tools (webpack, Vite, etc.)
- Package manager files (`package.json`)
- Test framework
- TypeScript
- External libraries or CDN imports
- Multiple files / module splitting

## Common Tasks for AI Assistants

**Adding a new upgrade:**
1. Add a `let <upgradeName>Owned = false` variable in the state block
2. Add an upgrade button in the HTML upgrades section
3. Add the purchase logic with cost check, coin deduction, and flag set
4. Update `updateCoinCount()` to disable the button when purchased
5. Include the upgrade in the `saveGame()`/`loadGame()` serialization
6. Add any passive income effect in `startCoinProduction()`

**Adding a new achievement:**
1. Add the condition check in `checkAchievements()`
2. Call `displayAchievement('Achievement Name')` when triggered
3. Add an `<li>` entry to the achievements list in the HTML
4. Include the unlock state in save/load if it needs to persist

**Modifying the prestige system:**
- The reset logic is in `resetGame()` — list every variable that should reset vs. persist
- The multiplier formula is in `getTotalMultiplier()` — update there for balance changes

**Modifying the save format:**
- Both `saveGame()` and `loadGame()` must be updated together
- The save key is `coinCollectorSave` in `localStorage`
- Use safe defaults (`|| 0`, `|| false`) in `loadGame()` for backward compatibility
