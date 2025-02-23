
import { Button } from "../ui/button";
import { Input } from "../ui/input";
<<<<<<< HEAD
import { useState } from "react";
import { Card } from "../ui/card";
=======
import { Upload } from "lucide-react";
import { useRef } from "react";
>>>>>>> frontend/main

interface UploadButtonProps {
  onFileUpload: (file: File) => void;
}

export const UploadButton = ({ onFileUpload }: UploadButtonProps) => {
<<<<<<< HEAD
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/webm")) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/webm")) {
=======
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
>>>>>>> frontend/main
      onFileUpload(file);
    }
  };

  return (
<<<<<<< HEAD
    <div className="w-full">
      <Card 
        className={`relative border-2 border-dashed p-8 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          accept="audio/mpeg,audio/mp3,audio/webm"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Arrastra tu archivo aquí o haz click para seleccionar
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Formatos soportados: MP3, WebM (máximo 10MB)
            </p>
          </div>
        </div>
      </Card>
=======
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
>>>>>>> frontend/main
    </div>
  );
};
