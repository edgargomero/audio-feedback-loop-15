
import { RecordButton } from "./RecordButton";
import { ProgressIndicator } from "./ProgressIndicator";

interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  progressValue: number;
  recordingTime: number;
}

export const RecordingControls = ({
  isRecording,
  onToggleRecording,
  progressValue,
  recordingTime,
}: RecordingControlsProps) => {
  return (
    <div className="text-center space-y-6">
      <RecordButton 
        isRecording={isRecording}
        onToggleRecording={onToggleRecording}
      />
      {isRecording && (
        <ProgressIndicator value={progressValue} time={recordingTime} />
      )}
    </div>
  );
};
