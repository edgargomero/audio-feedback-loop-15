
import { Progress } from "../ui/progress";

interface ProgressIndicatorProps {
  value: number;
  time?: number;
}

export const ProgressIndicator = ({ value, time }: ProgressIndicatorProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {time !== undefined && (
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Grabando...</span>
          <span>{formatTime(time)}</span>
        </div>
      )}
      <Progress value={value} className="h-2" />
      {value < 100 && !time && (
        <p className="text-sm text-center text-gray-500">
          Procesando audio... {value}%
        </p>
      )}
    </div>
  );
};
