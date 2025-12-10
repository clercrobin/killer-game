# Killer Game

A web application to manage assassination-style party games. Players are assigned targets and challenges, and must complete their challenges to eliminate their targets.

## Features

- **Admin Panel**: Configure groups, players, challenges, and couples/constraints
- **Player View**: Players can look up their assignments by name
- **Ring Assignment**: Automatically generates a ring of targets ensuring couples aren't adjacent
- **Group Dispersion**: Configurable spread factor to mix groups in the ring
- **Elimination Tracking**: Mark players as eliminated and automatically reassign targets
- **Data Persistence**: Game state saved to localStorage
- **Export/Import**: Export and import game data as JSON

## Getting Started

### Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Push this code to the `main` branch
3. Go to Settings > Pages
4. Under "Build and deployment", select "GitHub Actions"
5. The app will automatically deploy when you push to `main`

## Usage

### Admin Setup

1. Go to `/admin` and enter the admin password (default: `admin123`)
2. Configure groups with names and colors
3. Add players to groups (individually or bulk import)
4. Add/edit challenges
5. Define couples or constraints (players who shouldn't target each other directly)
6. Click "Start Game" to generate assignments

### Player View

1. Players visit the main page (`/`)
2. Type their name to look up their assignment
3. View their target and challenge

### Game Flow

1. Each player receives a target and a challenge
2. Complete the challenge with your target to eliminate them
3. When eliminated, the hunter inherits the eliminated player's target
4. Last player standing wins!

## Tech Stack

- React 19 + TypeScript
- Vite
- Zustand (state management)
- React Router
- GitHub Actions (CI/CD)

## Configuration

Edit `src/data/defaultData.ts` to customize default groups and challenges.

## License

MIT
