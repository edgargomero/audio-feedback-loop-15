
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Upload } from "lucide-react";
import { useRef } from "react";

interface UploadButtonProps {
  onFileUpload: (file: File) => void;
}

export const UploadButton = ({ onFileUpload }: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Input
        type="file"
        accept="audio/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        onClick={handleClick}
        className="w-16 h-16 rounded-full flex items-center justify-center"
      >
        <Upload className="w-6 h-6" />
      </Button>
      <p className="text-sm text-gray-500">
        Haz click para seleccionar un archivo
      </p>
    </div>
  );
};
