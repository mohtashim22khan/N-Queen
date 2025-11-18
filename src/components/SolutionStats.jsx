import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle2, Clock, Hash, XCircle } from "lucide-react";

export function SolutionStats({ result }) {
  if (!result) {
    return null;
  }

  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.success ? (
            <>
              <CheckCircle2 className="text-green-500" />
              Solution Found!
            </>
          ) : (
            <>
              <XCircle className="text-destructive" />
              No Solution Found
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            <span className="font-medium">Iterations</span>
          </div>
          <span className="text-2xl font-bold text-primary">
            {result.iterations.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-medium">Time</span>
          </div>
          <span className="text-2xl font-bold text-primary">
            {result.time.toFixed(3)}s
          </span>
        </div>

        {result.solution && (
          <div className="p-3 bg-gradient-to-br from-muted to-accent rounded-lg">
            <p className="text-xs font-mono text-muted-foreground mb-1">
              Solution Vector:
            </p>
            <p className="text-sm font-mono break-all">
              [{result.solution.join(", ")}]
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}