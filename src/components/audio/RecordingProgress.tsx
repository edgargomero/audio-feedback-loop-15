
import { Progress } from "../ui/progress";

interface RecordingProgressProps {
  progressValue: number;
  recordingTime: number;
  formatTime: (seconds: number) => string;
}

export const RecordingProgress = ({ progressValue, recordingTime, formatTime }: RecordingProgressProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>Grabando...</span>
        <span>{formatTime(recordingTime)}</span>
      </div>
      <Progress value={progressValue} className="h-2" />
    </div>
  );
};
