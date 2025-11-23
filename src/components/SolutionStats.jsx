import React from "react";
import { CheckCircle2, XCircle, Clock, Hash, RotateCcw, ArrowLeft } from "lucide-react";

export const SolutionStats = ({ result }) => {
  if (!result) return null;

  return (
    <div className="bg-card rounded-xl shadow-[var(--shadow-elegant)] p-6 animate-fade-in border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        {result.success ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <h3 className="text-xl font-semibold text-green-500">
              Solution Found
            </h3>
          </>
        ) : (
          <>
            <XCircle className="w-8 h-8 text-destructive" />
            <h3 className="text-xl font-semibold text-destructive">
              No Solution Found
            </h3>
          </>
        )}
      </div>

      <div className="space-y-4">
        {/* Iterations Row */}
        <div className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-md">
              <Hash className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-muted-foreground">Iterations</span>
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {result.iterations.toLocaleString()}
          </span>
        </div>

        {/* Restarts Row - Only shows if 'restarts' exists in result (Hill Climbing) */}
        {result.restarts !== undefined && (
          <div className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-md">
                <RotateCcw className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-medium text-muted-foreground">Restarts</span>
            </div>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {result.restarts}
            </span>
          </div>
        )}

        {/* Backtracks Row - Only shows if 'backtracks' exists in result (CSP) */}
        {result.backtracks !== undefined && (
          <div className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-md">
                <ArrowLeft className="w-4 h-4 text-blue-500" />
              </div>
              <span className="font-medium text-muted-foreground">Backtracks</span>
            </div>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {result.backtracks.toLocaleString()}
            </span>
          </div>
        )}

        {/* Time Row */}
        <div className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-md">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-muted-foreground">Time</span>
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {result.time.toFixed(3)}s
          </span>
        </div>
      </div>
    </div>
  );
};