
import { Button } from "../ui/button";
import { FileDown } from "lucide-react";

interface AnalysisResultProps {
  analysisResult: string;
  onDownload: () => void;
}

export const AnalysisResult = ({ analysisResult, onDownload }: AnalysisResultProps) => {
  return (
    <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileDown className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {analysisResult}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="flex items-center space-x-2"
        >
          <FileDown className="h-4 w-4" />
          <span>Descargar</span>
        </Button>
      </div>
    </div>
  );
};
