
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { UploadButton } from "../../audio/UploadButton";
import { RecordButton } from "../../audio/RecordButton";
import { ProcessingCountdown } from "../../audio/ProcessingCountdown";

interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (file: File) => void;
}

export const UploadModal = ({ isOpen, onOpenChange, onFileUpload }: UploadModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeLeft, setProcessingTimeLeft] = useState(120);
  const processingInterval = useRef<NodeJS.Timeout>();
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        onFileUpload(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Grabación iniciada",
        description: "Hablando...",
      });
    } catch (error) {
      console.error("Error al iniciar la grabación:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la grabación",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast({
        title: "Grabación finalizada",
        description: "Procesando audio...",
      });
    }
  };

  const cancelProcessing = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    setIsProcessing(false);
    setProgressValue(0);
    setProcessingTimeLeft(120);
    setPdfReady(false);
    setPdfUrl(null);
    toast({
      title: "Procesamiento cancelado",
      description: "Se ha cancelado el procesamiento del audio",
    });
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      toast({
        title: "Descargando PDF",
        description: "Tu análisis se está descargando...",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="upload-modal-description"
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Subir o Grabar Audio</DialogTitle>
          <DialogDescription id="upload-modal-description">
            Selecciona un archivo de audio para subir o graba uno nuevo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
              <TabsTrigger value="record">Grabar Audio</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <UploadButton onFileUpload={onFileUpload} />
            </TabsContent>
            <TabsContent value="record" className="mt-4">
              <div className="flex flex-col items-center gap-4">
                <RecordButton
                  isRecording={isRecording}
                  onToggleRecording={isRecording ? handleStopRecording : handleStartRecording}
                />
                <p className="text-sm text-gray-500">
                  {isRecording ? "Haz click para detener" : "Haz click para empezar a grabar"}
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          {progressValue > 0 && progressValue < 100 && (
            <div className="space-y-2">
              <Progress value={progressValue} />
              <p className="text-sm text-center text-gray-500">
                Procesando audio... {progressValue}%
              </p>
            </div>
          )}
          
          {isProcessing && (
            <div className="space-y-4">
              <ProcessingCountdown
                timeLeft={processingTimeLeft}
                onCancel={cancelProcessing}
              />
            </div>
          )}

          {pdfReady && pdfUrl && (
            <div className="flex flex-col items-center gap-4 pt-4">
              <p className="text-sm text-green-600 font-medium">
                ¡Tu análisis está listo!
              </p>
              <Button
                onClick={handleDownloadPDF}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
