import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Brain, Cpu, Play, Pause, SkipForward, Gauge } from "lucide-react";

export function SolverControls({
  boardSize,
  algorithm,
  isRunning,
  isPaused,
  speed,
  stepMode,
  onBoardSizeChange,
  onAlgorithmChange,
  onSpeedChange,
  onSolve,
  onPauseResume,
  onStep,
  onToggleStepMode,
}) {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="board-size" className="text-base font-semibold">
              Board Size: {boardSize}×{boardSize}
            </Label>
          </div>
          <Slider
            id="board-size"
            min={4}
            max={12}
            step={1}
            value={[boardSize]}
            onValueChange={(values) => onBoardSizeChange(values[0])}
            disabled={isRunning}
            className="py-2"
          />
          <p className="text-sm text-muted-foreground">
            Select the number of queens (4-12)
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="algorithm" className="text-base font-semibold">
            Algorithm
          </Label>
          <Select
            value={algorithm}
            onValueChange={(value) => onAlgorithmChange(value)}
            disabled={isRunning}
          >
            <SelectTrigger id="algorithm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hillClimbing">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>Hill Climbing</span>
                </div>
              </SelectItem>
              <SelectItem value="cspBacktracking">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>CSP Backtracking</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {algorithm === "hillClimbing"
              ? "Local search with random restarts"
              : "Systematic constraint satisfaction"}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="speed" className="text-base font-semibold flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Animation Speed
            </Label>
          </div>
          <Slider
            id="speed"
            min={1}
            max={100}
            step={1}
            value={[speed]}
            onValueChange={(values) => onSpeedChange(values[0])}
            disabled={isRunning}
            className="py-2"
          />
          <p className="text-sm text-muted-foreground">
            {speed < 30 ? "Slow" : speed < 70 ? "Medium" : "Fast"} ({speed}ms delay)
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onToggleStepMode}
            disabled={isRunning}
            variant={stepMode ? "default" : "outline"}
            className="w-full"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            {stepMode ? "Step Mode: ON" : "Step Mode: OFF"}
          </Button>
        </div>

        <Button
          onClick={onSolve}
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isRunning ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Solving...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Solve N-Queens
            </>
          )}
        </Button>

        {isRunning && (
          <div className="flex gap-2">
            <Button
              onClick={onPauseResume}
              className="flex-1"
              variant="outline"
            >
              {isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            {stepMode && isPaused && (
              <Button
                onClick={onStep}
                variant="outline"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}