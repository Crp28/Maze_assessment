# Maze Assessment Game

An interactive maze-based math assessment game built with React, TypeScript, and Vite. Players navigate through a procedurally generated maze to answer math questions within a time limit.

![Maze Game Screenshot](https://github.com/user-attachments/assets/fb96ff65-f288-4117-95e0-436c10fba2ea)

## Features

- **Interactive Maze Navigation**: Use W/A/S/D or arrow keys to navigate through the maze
- **15 Math Questions**: Progressive difficulty covering algebra, trigonometry, and more
- **Multi-language Support**: English, Spanish, French, Simplified Chinese, and Traditional Chinese
- **Accessibility Features**: 
  - Text-to-speech for questions and answers
  - Adjustable zoom (50%-200%)
  - Keyboard-only navigation
- **Time-limited Challenges**: 50 seconds per question
- **Fair Answer Placement**: Answers are strategically placed at similar distances with early path divergence

## Live Demo

Visit the live demo at: [https://crp28.github.io/Maze_assessment/](https://crp28.github.io/Maze_assessment/)

## Local Development

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173/Maze_assessment/`

### Build for Production

```bash
# Build the application
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## Deployment

The project is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch. The deployment is handled by a GitHub Actions workflow (`.github/workflows/deploy.yml`).

## How to Play

1. Read the math question displayed at the top
2. Navigate through the maze using W/A/S/D or arrow keys
3. Find the answer token (A, B, C, or D) in the maze
4. Press F to select your answer
5. Press F again to confirm your selection
6. Complete all 15 questions to see your final score

## Technologies Used

- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Canvas API**: For rendering the maze
- **Web Speech API**: For text-to-speech functionality

## Project Structure

```
├── src/
│   ├── MazeGame.tsx      # Main game component
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Pages deployment workflow
└── index.html           # HTML template
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
