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
        break; // Local minimum, restart
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

  // --- FIX STARTS HERE ---
  // Handle rows that have pre-placed queens
  if (initialPositions && initialPositions.has(row)) {
    const fixedCol = initialPositions.get(row);

    // 1. CRITICAL: Check if the pre-placed queen is actually valid 
    // against the board built so far.
    if (!isSafe(board, row, fixedCol)) {
      return false; // The user's initial setup (or previous path) makes this impossible
    }

    // 2. Add the fixed queen to the board so subsequent rows know it exists
    board.push(fixedCol);

    // Optional: Visualize this step (so the user sees the fixed queen "lock in")
    if (onStep && stats.iterations % 10 === 0) {
        await onStep([...board], () => controls?.paused || false);
    }

    // 3. Recurse to the next row
    const result = await solveCSPRecursive(
      board,
      row + 1,
      n,
      stats,
      onStep,
      controls,
      initialPositions
    );

    // 4. If solution not found, we must POP this fixed queen to restore 
    // the board state for the previous caller. 
    // If solution WAS found, we leave it so the final solution is complete.
    if (!result) {
      board.pop();
    }

    return result;
  }
  // --- FIX ENDS HERE ---

  
  for (let col = 0; col < n; col++) {
    if (isSafe(board, row, col)) {
      board.push(col);

      if (onStep && stats.iterations % 10 === 0) {
        await onStep([...board], () => controls?.paused || false);
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
  const stats = { iterations: 0 };

  // Optimization: We can pre-fill the board with initial positions 
  // ONLY if they are continuous from row 0. 
  // However, to be safe and let the recursive logic handle validation, 
  // it is often safer to start with an empty board or only fill up to the first gap.
  
  const initialPosMap = initialPositions || new Map();
  
  // We fill until we hit a gap. The recursive function will handle 
  // picking up the specific fixed positions later down the tree.
  for (let row = 0; row < n; row++) {
    if (initialPosMap.has(row)) {
      board.push(initialPosMap.get(row));
    } else {
      break; 
    }
  }

  // We must validate the initial chunk we just pushed. 
  // If the user put queens at (0,0) and (1,1) [diagonal attack], 
  // we need to catch it before starting.
  let isValidStart = true;
  for(let r = 0; r < board.length; r++) {
      // Check this queen against previous ones in the partial board
      if(!isSafe(board, r, board[r])) { 
          // Note: isSafe checks board[0...r-1] against r. 
          // However, isSafe implementation reads from 'board'. 
          // Since 'board' is fully filled up to the current point, 
          // we need to be careful not to check a row against itself.
          // The existing isSafe implementation loops `r < row`, so it is safe.
          isValidStart = false; 
          break; 
      }
  }

  let hasSolution = false;
  if (isValidStart) {
      hasSolution = await solveCSPRecursive(
        board,
        board.length, // Start after the pre-filled chunk
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
    time: (endTime - startTime) / 1000,
    success: hasSolution,
  };
}