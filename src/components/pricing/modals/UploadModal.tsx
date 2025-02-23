
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadModal = ({ isOpen, onOpenChange, onFileUpload }: UploadModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Archivo de Audio</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="audio-file" className="sr-only">
              Seleccionar archivo
            </label>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <label 
                  htmlFor="audio-file" 
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Arrastra tu archivo aquí o haz click para seleccionar
                  </span>
                </label>
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/webm"
                  className="hidden"
                  onChange={onFileUpload}
                />
              </div>
              <span className="text-xs text-gray-500">
                Formatos soportados: MP3 (máximo 10MB)
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
