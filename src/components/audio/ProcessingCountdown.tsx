
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface ProcessingCountdownProps {
  timeLeft: number;
  onCancel: () => void;
}

export const ProcessingCountdown = ({ timeLeft, onCancel }: ProcessingCountdownProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Generando análisis...
        </span>
        <span className="text-sm font-medium">
          {formatTime(timeLeft)}
        </span>
      </div>
      <Progress 
        value={(120 - timeLeft) / 120 * 100} 
        className="h-2"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        className="w-full flex items-center justify-center gap-2"
      >
        <X className="h-4 w-4" />
        <span>Cancelar procesamiento</span>
      </Button>
    </div>
  );
};

