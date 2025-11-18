import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Download, FileText, Image } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export function ExportControls({ solution, boardSize, result, algorithm }) {
  const handleExportImage = async () => {
    const boardElement = document.getElementById("chess-board");
    if (!boardElement) {
      toast.error("Board not found");
      return;
    }

    try {
      const canvas = await html2canvas(boardElement, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.download = `n-queens-${boardSize}x${boardSize}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Image exported successfully");
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Failed to export image");
    }
  };

  const handleExportText = () => {
    if (!solution) {
      toast.error("No solution to export");
      return;
    }

    const text = `N-Queens Solution
Board Size: ${boardSize}×${boardSize}
Algorithm: ${algorithm === "hillClimbing" ? "Hill Climbing" : "CSP Backtracking"}
${result ? `Iterations: ${result.iterations}\nTime: ${result.time.toFixed(3)}s\n` : ""}
Solution:
${solution.map((col, row) => `Row ${row + 1}: Column ${col + 1}`).join("\n")}

Board Representation:
${Array.from({ length: boardSize }, (_, row) => 
  Array.from({ length: boardSize }, (_, col) => 
    solution[row] === col ? "Q" : "."
  ).join(" ")
).join("\n")}`;

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `n-queens-${boardSize}x${boardSize}-${Date.now()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    
    toast.success("Solution exported as text");
  };

  const isDisabled = !solution;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Solution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleExportImage}
          disabled={isDisabled}
          className="w-full"
          variant="outline"
        >
          <Image className="w-4 h-4 mr-2" />
          Export as Image
        </Button>
        <Button
          onClick={handleExportText}
          disabled={isDisabled}
          className="w-full"
          variant="outline"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export as Text
        </Button>
      </CardContent>
    </Card>
  );
}