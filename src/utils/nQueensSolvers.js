// default values for maxrestarts and maxstepsperrun
export const defaultMaxRestarts = 100;
export const defaultMaxStepsPerRun = 1000;

// --- HILL CLIMBING HELPERS ---

function calculateAttackingPairs(state) {
  const n = state.length;
  let attacks = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (state[i] === state[j]) {
        attacks++;
      } else if (Math.abs(state[i] - state[j]) === Math.abs(i - j)) {
        attacks++;
      }
    }
  }
  return attacks;
}

function generateRandomBoard(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * n));
}

// --- HILL CLIMBING ALGORITHM ---

export async function solveHillClimbing(
  n,
  maxRestarts = defaultMaxRestarts,
  maxStepsPerRun = defaultMaxStepsPerRun,
  onStep,
  controls
) {
  const startTime = performance.now();
  let totalSteps = 0;

  for (let restart = 0; restart < maxRestarts; restart++) {
    let currentState = generateRandomBoard(n);
    let currentAttacks = calculateAttackingPairs(currentState);

    if (onStep) {
      await onStep(
        [...currentState],
        { restarts: restart, iterations: totalSteps },
        () => controls?.paused || false
      );
    }

    for (let step = 0; step < maxStepsPerRun; step++) {
      totalSteps++;

      if (currentAttacks === 0) {
        const endTime = performance.now();
        return {
          solution: currentState,
          iterations: totalSteps,
          restarts: restart,
          time: (endTime - startTime) / 1000,
          success: true,
        };
      }

      let bestNeighbor = currentState;
      let minNeighborAttacks = currentAttacks;

      for (let rowToMove = 0; rowToMove < n; rowToMove++) {
        const originalCol = currentState[rowToMove];

        for (let newCol = 0; newCol < n; newCol++) {
          if (newCol === originalCol) continue;

          const neighborState = [...currentState];
          neighborState[rowToMove] = newCol;
          const neighborAttacks = calculateAttackingPairs(neighborState);

          if (neighborAttacks < minNeighborAttacks) {
            minNeighborAttacks = neighborAttacks;
            bestNeighbor = neighborState;
          }
        }
      }

      if (minNeighborAttacks >= currentAttacks) {
        break; // Local minimum
      }

      currentState = bestNeighbor;
      currentAttacks = minNeighborAttacks;

      if (onStep && step % 1 === 0) {
        await onStep(
          [...currentState],
          { restarts: restart, iterations: totalSteps },
          () => controls?.paused || false
        );
      }
    }
  }

  const endTime = performance.now();
  return {
    solution: null,
    iterations: totalSteps,
    restarts: maxRestarts,
    time: (endTime - startTime) / 1000,
    success: false,
  };
}

// --- CSP / BACKTRACKING HELPERS ---

function isSafe(board, row, col) {
  for (let r = 0; r < row; r++) {
    const existingCol = board[r];
    if (existingCol === col) return false;
    if (Math.abs(existingCol - col) === Math.abs(r - row)) return false;
  }
  return true;
}

// 1. The Recursive Helper (Internal use only)
async function solveCSPRecursive(
  board,
  row,
  n,
  stats,
  onStep,
  controls,
  initialPositions
) {
  stats.iterations++;

  // Base case: All queens placed
  if (row === n) {
    return true;
  }

  // Handle fixed positions (User defined)
  if (initialPositions && initialPositions.has(row)) {
    const fixedCol = initialPositions.get(row);

    if (!isSafe(board, row, fixedCol)) {
      return false;
    }

    board.push(fixedCol);

    if (onStep && stats.iterations % 10 === 0) {
      await onStep(
        [...board],
        { backtracks: stats.backtracks, iterations: stats.iterations },
        () => controls?.paused || false
      );
    }

    const result = await solveCSPRecursive(
      board,
      row + 1,
      n,
      stats,
      onStep,
      controls,
      initialPositions
    );

    if (!result) {
      board.pop();
    }
    return result;
  }

  // --- RANDOMIZATION LOGIC ---
  // Generate [0, 1, ... n-1]
  let columns = Array.from({ length: n }, (_, i) => i);

  // Shuffle columns so we try them in random order
  for (let i = columns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [columns[i], columns[j]] = [columns[j], columns[i]];
  }
  // ---------------------------

  // Iterate through shuffled columns
  for (const col of columns) {
    if (isSafe(board, row, col)) {
      board.push(col);

      if (onStep && stats.iterations % 1 === 0) {
        await onStep(
          [...board],
          { backtracks: stats.backtracks, iterations: stats.iterations },
          () => controls?.paused || false
        );
      }

      if (
        await solveCSPRecursive(
          board,
          row + 1,
          n,
          stats,
          onStep,
          controls,
          initialPositions
        )
      ) {
        return true;
      }

      // Backtrack
      board.pop();
      stats.backtracks++;
    }
  }

  return false;
}

// 2. The Main Exported Function (The Wrapper)
// This matches the signature called in Index.jsx
export async function solveCSPBacktracking(
  n,
  onStep,
  controls,
  initialPositions
) {
  const startTime = performance.now();
  
  // Initialize the state objects here
  const board = [];
  const stats = { iterations: 0, backtracks: 0 };
  const initialPosMap = initialPositions || new Map();

  // Pre-fill board with any fixed positions starting from row 0
  // (Only if they are contiguous from the start, otherwise recursion handles them)
  // Ideally, we just let recursion handle it, but we can do a quick check here.
  
  // Validate start (check if initial positions conflict with each other)
  // ... (Optional validation logic could go here)

  let hasSolution = false;
  
  // Call the recursive helper
  hasSolution = await solveCSPRecursive(
    board,
    0, // Start at row 0
    n,
    stats,
    onStep,
    controls,
    initialPosMap
  );

  const endTime = performance.now();

  return {
    solution: hasSolution ? board : null,
    iterations: stats.iterations,
    backtracks: stats.backtracks,
    time: (endTime - startTime) / 1000,
    success: hasSolution,
  };
}