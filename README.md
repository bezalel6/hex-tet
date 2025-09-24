# Hex-Tet 🎮

A responsive, web-based hexagonal Tetris-like puzzle game built with TypeScript, React, and modern web technologies.

## 🎯 Features

- **Hexagonal Grid**: Play on a unique hexagonal board with edge length of 5 cells
- **7 Unique Tetromino Pieces**: All connected 4-hex shapes plus rare single-hex pieces
- **Drag & Drop Gameplay**: Intuitive controls with drag-and-drop piece placement
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Line Clearing**: Create straight lines in any of the three hexagonal axes to score
- **Progressive Difficulty**: Level increases as you clear more lines
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Deterministic RNG**: Seed-based random generation for reproducible sessions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hex-tet.git
cd hex-tet
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎮 How to Play

### Controls

- **Drag**: Click and drag pieces from the right panel to place them on the board
- **Rotate**: Click the rotation button on each piece or press 'R' while dragging
- **New Game**: Press Space bar or click the "Reset Game" button

### Objective

- Place hexagonal pieces on the board to create complete lines
- Lines can be formed in three directions (horizontal and two diagonals)
- Clear lines to score points and increase your level
- Game ends when none of the 3 available pieces can be placed

### Scoring

- **Piece Placement**: Earn points based on piece size and current level
- **Line Clear**: 10 points per line × level multiplier
- **Multi-line Bonus**: Clear multiple lines at once for bonus points
  - 2 lines: 1.5x multiplier
  - 3 lines: 2x multiplier
  - 4+ lines: 3x multiplier

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Zustand
- **Styling**: TailwindCSS 4
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions + Vercel

## 📁 Project Structure

```
hex-tet/
├── src/
│   ├── components/       # React components
│   │   ├── HexGrid.tsx
│   │   ├── HexCell.tsx
│   │   ├── PiecePreview.tsx
│   │   ├── PieceDraggable.tsx
│   │   └── HUD.tsx
│   ├── engine/           # Game logic
│   │   ├── coords.ts     # Hexagonal coordinate system
│   │   ├── shapes.ts     # Piece definitions
│   │   ├── board.ts      # Board state management
│   │   └── engine.ts     # Game engine
│   ├── hooks/           
│   │   └── useGameStore.ts  # Zustand store
│   ├── utils/
│   │   └── scoring.ts    # Scoring system
│   └── App.tsx
├── tests/               # Unit tests
│   ├── coords.spec.ts
│   ├── shapes.spec.ts
│   ├── board.spec.ts
│   └── engine.spec.ts
└── package.json
```

## 🧪 Testing

Run unit tests:
```bash
pnpm test
```

Run tests with coverage:
```bash
pnpm test:coverage
```

Run linting:
```bash
pnpm lint
```

Format code:
```bash
pnpm format
```

## 🚢 Deployment

### One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hex-tet)

### Manual Deployment

1. Build the project:
```bash
pnpm build
```

2. Deploy the `dist` folder to your hosting service

### Environment Variables

The game supports configuration through environment variables:

- `VITE_EDGE_LENGTH`: Board edge length (default: 5)
- `VITE_SINGLE_HEX_RARITY`: Chance of single hex piece (default: 0.05)
- `VITE_POINTS_PER_LINE`: Base points per cleared line (default: 10)

## 🔧 Configuration

Game parameters can be configured in `src/engine/engine.ts`:

```typescript
const config = {
  edgeLength: 5,          // Board size (edges = 5 cells)
  singleHexRarity: 0.05,  // 5% chance for single hex
  pointsPerLine: 10,      // Base score per line
  piecesPerSet: 3,        // Pieces available at once
  seed: '',               // RNG seed (empty = random)
};
```

## 📈 Performance

- **Test Coverage**: >90% for core game logic
- **Bundle Size**: <200KB gzipped
- **Lighthouse Score**: 95+ for desktop, 90+ for mobile
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- [ ] Leaderboard with backend integration
- [ ] Undo last move feature
- [ ] Hints system for stuck players
- [ ] Daily challenges with fixed seeds
- [ ] Achievement system
- [ ] Sound effects and background music
- [ ] Multiplayer mode
- [ ] Custom board sizes and shapes
- [ ] Theme customization

## 🙏 Acknowledgments

- Inspired by classic Tetris and modern hexagonal puzzle games
- Built with the amazing React ecosystem
- Hexagonal math based on [Red Blob Games](https://www.redblobgames.com/grids/hexagons/) guide

---

Made with ❤️ using TypeScript and React