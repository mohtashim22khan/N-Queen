
//default values for maxrestarts and maxstepsperrun
export const defaultMaxRestarts = 100;
export const defaultMaxStepsPerRun = 1000;

// Calculate attacking pairs for Hill Climbing
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

// Generate random board for Hill Climbing
function generateRandomBoard(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * n));
}

// Hill Climbing with Random Restarts
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

    // Pass restart info to onStep
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
          restarts: restart, // Return final restarts
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
        break; // Local minimum, restart
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

// Check if placing a queen is safe
function isSafe(board, row, col) {
  for (let r = 0; r < row; r++) {
    const existingCol = board[r];
    // Check Column Conflict
    if (existingCol === col) return false;
    // Check Diagonal Conflict
    if (Math.abs(existingCol - col) === Math.abs(r - row)) return false;
  }
  return true;
}

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

  if (row === n) {
    return true; // Solution found
  }

  // Handle rows that have pre-placed queens
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

  for (let col = 0; col < n; col++) {
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

      board.pop();
      stats.backtracks++; // Increment backtrack counter
    }
  }

  return false;
}

// CSP Backtracking
export async function solveCSPBacktracking(
  n,
  onStep,
  controls,
  initialPositions
) {
  const startTime = performance.now();
  const board = [];
  const stats = { iterations: 0, backtracks: 0 }; // Initialize backtracks

  const initialPosMap = initialPositions || new Map();

  for (let row = 0; row < n; row++) {
    if (initialPosMap.has(row)) {
      board.push(initialPosMap.get(row));
    } else {
      break;
    }
  }

  let isValidStart = true;
  for (let r = 0; r < board.length; r++) {
    if (!isSafe(board, r, board[r])) {
      isValidStart = false;
      break;
    }
  }

  let hasSolution = false;
  if (isValidStart) {
    hasSolution = await solveCSPRecursive(
      board,
      board.length,
      n,
      stats,
      onStep,
      controls,
      initialPosMap
    );
  }

  const endTime = performance.now();

  return {
    solution: hasSolution ? board : null,
    iterations: stats.iterations,
    backtracks: stats.backtracks, // Return total backtracks
    time: (endTime - startTime) / 1000,
    success: hasSolution,
  };
}