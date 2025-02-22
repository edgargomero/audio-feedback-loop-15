
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { Input } from "../ui/input";

interface ExtraRecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onFileUpload: (file: File) => void;
}

export const ExtraRecordButton = ({ 
  isRecording, 
  onToggleRecording,
  onFileUpload 
}: ExtraRecordButtonProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3")) {
      onFileUpload(file);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={onToggleRecording}
        variant="outline"
        className={`w-16 h-16 rounded-full flex items-center justify-center ${
          isRecording ? "recording-pulse" : ""
        }`}
      >
        <Upload className="w-6 h-6" />
      </Button>
      <Input
        type="file"
        accept="audio/mpeg,audio/mp3"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
      />
    </div>
  );
};
