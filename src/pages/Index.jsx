import { useState, useRef } from "react";
import { Crown } from "lucide-react";
import { ChessBoard } from "../components/ChessBoard";
import { SolverControls } from "../components/SolverControls";
import { SolutionStats } from "../components/SolutionStats";
import { SolutionHistory } from "../components/SolutionHistory";
import { PerformanceGraph } from "../components/PerformanceGraph";
import { ExportControls } from "../components/ExportControls";
import {
  solveHillClimbing,
  solveCSPBacktracking,
  defaultMaxRestarts,
  defaultMaxStepsPerRun
} from "../utils/nQueensSolvers";
import { toast } from "sonner";



const Index = () => {
  const [boardSize, setBoardSize] = useState(8);
  const [algorithm, setAlgorithm] = useState("hillClimbing");
  const [solution, setSolution] = useState(null);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [stepMode, setStepMode] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  // Track live stats for display if needed
  const [liveStats, setLiveStats] = useState({ restarts: 0, backtracks: 0 });
  const [placementMode, setPlacementMode] = useState(false);
  const [initialPositions, setInitialPositions] = useState(new Map());
  const [history, setHistory] = useState([]);
  const controlsRef = useRef({ paused: false, speed: 50, stepMode: false });
  const stepResolveRef = useRef(null);

  const handleSolve = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setSolution(null);
    setResult(null);
    setStepCount(0);
    setLiveStats({ restarts: 0, backtracks: 0 });
    controlsRef.current = { paused: false, speed, stepMode };

    try {
      let solverResult;

      // Accepted stats param to update live counters
      const stepCallback = async (state, stats) => {
        setSolution([...state]);
        setStepCount((prev) => prev + 1);

        if (stats) {
          setLiveStats((prev) => ({ ...prev, ...stats }));
        }

        // Apply speed delay (skip in step mode)
        if (!controlsRef.current.stepMode) {
          const delay = 100 - speed;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Handle step mode - always pause at each step
        if (controlsRef.current.stepMode) {
          setIsPaused(true);
          controlsRef.current.paused = true;
          await new Promise((resolve) => {
            stepResolveRef.current = resolve;
          });
        } else {
          // Handle regular pause
          while (controlsRef.current.paused) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      };

      if (algorithm === "hillClimbing") {
        solverResult = await solveHillClimbing(
          boardSize,
          defaultMaxRestarts,
          defaultMaxStepsPerRun,
          stepCallback,
          controlsRef.current
        );
      } else {
        solverResult = await solveCSPBacktracking(
          boardSize,
          stepCallback,
          controlsRef.current,
          initialPositions.size > 0 ? initialPositions : undefined
        );
      }

      setResult(solverResult);
      setSolution(solverResult.solution);

      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        algorithm,
        boardSize,
        result: solverResult,
        timestamp: new Date(),
      };
      setHistory((prev) => [historyEntry, ...prev].slice(0, 20));

      if (solverResult.success) {
        // --- CUSTOM SUCCESS SCREEN LOGIC ---
        const details =
          algorithm === "hillClimbing"
            ? `Restarts: ${solverResult.restarts}`
            : `Backtracks: ${solverResult.backtracks}`;

        toast.success(
          `Solution found in ${solverResult.iterations} iterations!`,
          {
            description: `${details} • Time: ${solverResult.time.toFixed(3)}s`,
            duration: 10000, // Display for 5 seconds
          }
        );
      } else {
        toast.error("No solution found", {
          description: "Try using a different algorithm or board size",
        });
      }
    } catch (error) {
      console.error("Error solving N-Queens:", error);
      toast.error("An error occurred while solving");
    } finally {
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  const handlePauseResume = () => {
    controlsRef.current.paused = !controlsRef.current.paused;
    setIsPaused(!isPaused);
  };

  const handleStep = () => {
    if (stepResolveRef.current) {
      stepResolveRef.current();
      stepResolveRef.current = null;
      setIsPaused(false);
      controlsRef.current.paused = false;
    }
  };

  const handleSelectHistory = (entry) => {
    setSolution(entry.result.solution);
    setResult(entry.result);
    setBoardSize(entry.boardSize);
    setAlgorithm(entry.algorithm);
    toast.info("Loaded solution from history");
  };

  const handleSquareClick = (row, col) => {
    if (!placementMode) return;

    setInitialPositions((prev) => {
      const newPositions = new Map(prev);

      // If clicking on same position, remove it
      if (newPositions.get(row) === col) {
        newPositions.delete(row);
        return newPositions;
      }

      // Check for conflicts with existing queens
      for (const [existingRow, existingCol] of newPositions.entries()) {
        // Same column check
        if (existingCol === col) {
          toast.error("Invalid placement: Queen already in this column");
          return prev;
        }

        // Diagonal check
        if (Math.abs(existingRow - row) === Math.abs(existingCol - col)) {
          toast.error("Invalid placement: Queens attack each other diagonally");
          return prev;
        }
      }

      // Valid placement
      newPositions.set(row, col);
      return newPositions;
    });
  };

  const handleTogglePlacementMode = () => {
    setPlacementMode(!placementMode);
    if (!placementMode) {
      setSolution(null);
      setResult(null);
    }
  };

  const handleClearInitialPositions = () => {
    setInitialPositions(new Map());
    toast.info("Cleared all initial positions");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-queen animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              N-Queens Solver
            </h1>
            <Crown className="w-12 h-12 text-queen animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visualize and compare AI algorithms solving the classic N-Queens
            problem
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <SolverControls
              boardSize={boardSize}
              algorithm={algorithm}
              isRunning={isRunning}
              isPaused={isPaused}
              speed={speed}
              stepMode={stepMode}
              placementMode={placementMode}
              initialPositionsCount={initialPositions.size}
              onBoardSizeChange={setBoardSize}
              onAlgorithmChange={setAlgorithm}
              onSpeedChange={setSpeed}
              onSolve={handleSolve}
              onPauseResume={handlePauseResume}
              onStep={handleStep}
              onToggleStepMode={() => setStepMode(!stepMode)}
              onTogglePlacementMode={handleTogglePlacementMode}
              onClearInitialPositions={handleClearInitialPositions}
            />
            <SolutionStats result={result} />

          </div>

          {/* Right Panel - Chessboard */}
          <div className="lg:col-span-2">
            <div
              className="bg-card rounded-xl shadow-[var(--shadow-elegant)] p-6 min-h-[600px] relative"
              id="chess-board"
            >
              {isRunning && (
                <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-semibold shadow-lg backdrop-blur-sm z-10 flex flex-col gap-1 min-w-[140px]">
                  <div>Step: {stepCount}</div>
                  {algorithm === "hillClimbing" && (
                    <div className="text-sm opacity-90">
                      Restarts: {liveStats.restarts}
                    </div>
                  )}
                  {algorithm === "csp" && (
                    <div className="text-sm opacity-90">
                      Backtracks: {liveStats.backtracks}
                    </div>
                  )}
                </div>
              )}
              <ChessBoard
                solution={solution}
                size={boardSize}
                placementMode={placementMode}
                initialPositions={initialPositions}
                onSquareClick={handleSquareClick}
              />
            </div>
          </div>
        </div>

        {/* History and Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <SolutionHistory
            history={history}
            onSelectSolution={handleSelectHistory}
          />
          <PerformanceGraph history={history} />
        </div>

        {/* Info Section */}
        <footer className="mt-12 text-center">
          <div className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4">
              About the N-Queens Problem
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary">
                  Hill Climbing
                </h3>
                <p className="text-sm text-muted-foreground">
                  A local search algorithm that starts with a random
                  configuration and iteratively moves to better neighboring
                  states. Uses random restarts to escape local minima.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary">
                  CSP Backtracking
                </h3>
                <p className="text-sm text-muted-foreground">
                  A systematic search that places queens row by row,
                  backtracking when constraints are violated. Guarantees finding
                  a solution if one exists.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;