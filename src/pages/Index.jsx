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
  const [history, setHistory] = useState([]);
  const controlsRef = useRef({ paused: false, speed: 50, stepMode: false });
  const stepResolveRef = useRef(null);

  const handleSolve = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setSolution(null);
    setResult(null);
    controlsRef.current = { paused: false, speed, stepMode };

    try {
      let solverResult;

      const stepCallback = async (state, shouldPause) => {
        setSolution([...state]);
        
        // Apply speed delay
        const delay = 100 - speed;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Handle pause/step mode
        if (controlsRef.current.stepMode && shouldPause()) {
          await new Promise((resolve) => {
            stepResolveRef.current = resolve;
          });
        } else {
          while (controlsRef.current.paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      };

      if (algorithm === "hillClimbing") {
        solverResult = await solveHillClimbing(boardSize, 100, 1000, stepCallback, controlsRef.current);
      } else {
        solverResult = await solveCSPBacktracking(boardSize, stepCallback, controlsRef.current);
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
        toast.success(`Solution found in ${solverResult.iterations} iterations!`, {
          description: `Completed in ${solverResult.time.toFixed(3)} seconds`,
        });
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
    if (stepMode) {
      controlsRef.current.paused = !controlsRef.current.paused;
      setIsPaused(!isPaused);
    } else {
      controlsRef.current.paused = !controlsRef.current.paused;
      setIsPaused(!isPaused);
    }
  };

  const handleStep = () => {
    if (stepResolveRef.current) {
      stepResolveRef.current();
      stepResolveRef.current = null;
    }
  };

  const handleSelectHistory = (entry) => {
    setSolution(entry.result.solution);
    setResult(entry.result);
    setBoardSize(entry.boardSize);
    setAlgorithm(entry.algorithm);
    toast.info("Loaded solution from history");
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
            Visualize and compare AI algorithms solving the classic N-Queens problem
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
              onBoardSizeChange={setBoardSize}
              onAlgorithmChange={setAlgorithm}
              onSpeedChange={setSpeed}
              onSolve={handleSolve}
              onPauseResume={handlePauseResume}
              onStep={handleStep}
              onToggleStepMode={() => setStepMode(!stepMode)}
            />
            <SolutionStats result={result} />
            <ExportControls
              solution={solution}
              boardSize={boardSize}
              result={result}
              algorithm={algorithm}
            />
          </div>

          {/* Right Panel - Chessboard */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-[var(--shadow-elegant)] p-6 min-h-[600px]" id="chess-board">
              <ChessBoard solution={solution} size={boardSize} />
            </div>
          </div>
        </div>

        {/* History and Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <SolutionHistory history={history} onSelectSolution={handleSelectHistory} />
          <PerformanceGraph history={history} />
        </div>

        {/* Info Section */}
        <footer className="mt-12 text-center">
          <div className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4">About the N-Queens Problem</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary">Hill Climbing</h3>
                <p className="text-sm text-muted-foreground">
                  A local search algorithm that starts with a random configuration and iteratively 
                  moves to better neighboring states. Uses random restarts to escape local minima.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-primary">CSP Backtracking</h3>
                <p className="text-sm text-muted-foreground">
                  A systematic search that places queens row by row, backtracking when constraints 
                  are violated. Guarantees finding a solution if one exists.
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