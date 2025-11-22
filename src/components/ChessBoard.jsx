import React from 'react';
import { Crown } from 'lucide-react';

export function ChessBoard({ solution, size, placementMode, initialPositions, onSquareClick }) {
  const showingBoard = solution || placementMode;
  
  if (!showingBoard) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-muted-foreground text-lg">No solution to display yet</p>
      </div>
    );
  }

  const squareSize = Math.min(600 / size, 80);

  return (
    <div className="flex items-center justify-center p-6">
      <div
        className="grid gap-0 border-4 border-chess-dark rounded-lg overflow-hidden shadow-[var(--shadow-elegant)]"
        style={{
          gridTemplateColumns: `repeat(${size}, ${squareSize}px)`,
          gridTemplateRows: `repeat(${size}, ${squareSize}px)`,
        }}
      >
        {Array.from({ length: size * size }).map((_, index) => {
          const row = Math.floor(index / size);
          const col = index % size;
          const isLight = (row + col) % 2 === 0;
          
          // Logic handles finding queens in the solution array or the initial Map
          const hasQueenSolution = solution && solution[row] === col;
          const hasQueenInitial = initialPositions?.get(row) === col;
          const hasQueen = hasQueenSolution || hasQueenInitial;

          return (
            <div
              key={index}
              className={`
                relative flex items-center justify-center
                transition-all duration-300
                ${isLight ? "bg-chess-light" : "bg-chess-dark"}
                ${hasQueen ? "animate-pulse" : ""}
                ${placementMode ? "cursor-pointer hover:bg-primary/20" : ""}
              `}
              onClick={() => placementMode && onSquareClick?.(row, col)}
            >
              {hasQueen && (
                <Crown
                  className={`drop-shadow-[0_0_8px_hsl(var(--queen-glow))] ${
                    hasQueenInitial ? "text-accent" : "text-queen"
                  }`}
                  size={squareSize * 0.6}
                  strokeWidth={1.5}
                  fill="currentColor"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}