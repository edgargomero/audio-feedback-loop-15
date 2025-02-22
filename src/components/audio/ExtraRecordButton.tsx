
import { Button } from "../ui/button";
import { Mic } from "lucide-react";

interface ExtraRecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const ExtraRecordButton = ({ isRecording, onToggleRecording }: ExtraRecordButtonProps) => {
  return (
    <Button
      onClick={onToggleRecording}
      variant="outline"
      className={`w-16 h-16 rounded-full flex items-center justify-center ${
        isRecording ? "recording-pulse" : ""
      }`}
    >
      <Mic className="w-6 h-6" />
    </Button>
  );
};
