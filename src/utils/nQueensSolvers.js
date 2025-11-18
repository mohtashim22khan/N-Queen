// solvers.js

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
async function solveHillClimbing(
  n,
  maxRestarts = 100,
  maxStepsPerRun = 1000,
  onStep,
  controls
) {
  const startTime = performance.now();
  let totalSteps = 0;

  for (let restart = 0; restart < maxRestarts; restart++) {
    let currentState = generateRandomBoard(n);
    let currentAttacks = calculateAttackingPairs(currentState);

    if (onStep) {
      await onStep([...currentState], () => controls?.paused || false);
    }

    for (let step = 0; step < maxStepsPerRun; step++) {
      totalSteps++;

      if (currentAttacks === 0) {
        const endTime = performance.now();
        return {
          solution: currentState,
          iterations: totalSteps,
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
        break; // Local minimum — restart
      }

      currentState = bestNeighbor;
      currentAttacks = minNeighborAttacks;

      if (onStep && step % 5 === 0) {
        await onStep([...currentState], () => controls?.paused || false);
      }
    }
  }

  const endTime = performance.now();
  return {
    solution: null,
    iterations: totalSteps,
    time: (endTime - startTime) / 1000,
    success: false,
  };
}

// Check if placing a queen is safe
function isSafe(board, row, col) {
  for (let r = 0; r < row; r++) {
    if (board[r] === col) return false;
    if (Math.abs(board[r] - col) === Math.abs(r - row)) return false;
  }
  return true;
}

// CSP Backtracking recursive solver
async function solveCSPRecursive(board, row, n, stats, onStep, controls) {
  stats.iterations++;

  if (row === n) return true;

  for (let col = 0; col < n; col++) {
    if (isSafe(board, row, col)) {
      board.push(col);

      if (onStep && stats.iterations % 10 === 0) {
        await onStep([...board], () => controls?.paused || false);
      }

      if (await solveCSPRecursive(board, row + 1, n, stats, onStep, controls)) {
        return true;
      }

      board.pop();
    }
  }

  return false;
}

// CSP Backtracking wrapper
async function solveCSPBacktracking(
  n,
  onStep,
  controls
) {
  const startTime = performance.now();
  const board = [];
  const stats = { iterations: 0 };

  const hasSolution = await solveCSPRecursive(
    board,
    0,
    n,
    stats,
    onStep,
    controls
  );

  const endTime = performance.now();

  return {
    solution: hasSolution ? board : null,
    iterations: stats.iterations,
    time: (endTime - startTime) / 1000,
    success: hasSolution,
  };
}

// Export for JS usage
export {
  solveHillClimbing,
  solveCSPBacktracking
};
