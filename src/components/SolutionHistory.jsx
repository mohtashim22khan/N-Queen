import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Clock, Hash, CheckCircle, XCircle } from "lucide-react";

export function SolutionHistory({ history, onSelectSolution }) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solution History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No solutions yet. Run the solver to see history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solution History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelectSolution(entry)}
                className="p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {entry.result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold text-sm">
                      {entry.boardSize}×{entry.boardSize} Queens
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entry.algorithm === "hillClimbing" ? "Hill Climbing" : "CSP Backtracking"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span>{entry.result.iterations} iterations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{entry.result.time.toFixed(3)}s</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}