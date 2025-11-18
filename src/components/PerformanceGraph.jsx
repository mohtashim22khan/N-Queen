import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function PerformanceGraph({ history }) {
  // Aggregate data by board size and algorithm
  const aggregatedData = history.reduce((acc, entry) => {
    if (!entry.result.success) return acc;
    
    const key = entry.boardSize;
    if (!acc[key]) {
      acc[key] = {
        boardSize: key,
        hillClimbing: [],
        cspBacktracking: [],
      };
    }
    
    if (entry.algorithm === "hillClimbing") {
      acc[key].hillClimbing.push(entry.result.iterations);
    } else {
      acc[key].cspBacktracking.push(entry.result.iterations);
    }
    
    return acc;
  }, {});

  const chartData = Object.values(aggregatedData)
    .map((data) => ({
      boardSize: data.boardSize,
      hillClimbing: data.hillClimbing.length > 0
        ? Math.round(data.hillClimbing.reduce((a, b) => a + b, 0) / data.hillClimbing.length)
        : null,
      cspBacktracking: data.cspBacktracking.length > 0
        ? Math.round(data.cspBacktracking.reduce((a, b) => a + b, 0) / data.cspBacktracking.length)
        : null,
    }))
    .sort((a, b) => a.boardSize - b.boardSize);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Run multiple solutions to see performance comparison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Graph</CardTitle>
        <p className="text-sm text-muted-foreground">Average iterations by board size</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="boardSize" 
              label={{ value: 'Board Size', position: 'insideBottom', offset: -5 }}
              className="text-xs"
            />
            <YAxis 
              label={{ value: 'Iterations', angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="hillClimbing" 
              stroke="hsl(var(--primary))" 
              name="Hill Climbing"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="cspBacktracking" 
              stroke="hsl(var(--secondary))" 
              name="CSP Backtracking"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--secondary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}