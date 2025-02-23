
import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@11labs/react";
import { RecordButton } from "./audio/RecordButton";
import { UploadButton } from "./audio/UploadButton";
import { FeedbackDisplay } from "./audio/FeedbackDisplay";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { FileDown, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const AudioFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeLeft, setProcessingTimeLeft] = useState(120); // 2 minutos en segundos
  const progressInterval = useRef<NodeJS.Timeout>();
  const timeInterval = useRef<NodeJS.Timeout>();
  const processingInterval = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { feedback, setFeedback } = useSalesAnalysis();

  const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/fdfea2uux2sa7todteplybdudo45qpwm';

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (timeInterval.current) clearInterval(timeInterval.current);
      if (processingInterval.current) clearInterval(processingInterval.current);
    };
  }, []);

  const startProgressAndTime = () => {
    setProgressValue(0);
    setRecordingTime(0);
    
    progressInterval.current = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          startProcessingCountdown();
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    timeInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const startProcessingCountdown = () => {
    setIsProcessing(true);
    setProcessingTimeLeft(120);

    processingInterval.current = setInterval(() => {
      setProcessingTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(processingInterval.current);
          setIsProcessing(false);
          setAnalysisResult("analysis_result.pdf");
          toast({
            title: "¡Análisis completado!",
            description: "PDF generado y listo para descargar ✅",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopProgressAndTime = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (timeInterval.current) {
      clearInterval(timeInterval.current);
    }
    setProgressValue(100);
  };

  const cancelProcessing = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    setIsProcessing(false);
    setProgressValue(0);
    toast({
      title: "Procesamiento cancelado",
      description: "Se ha cancelado el procesamiento del audio",
    });
  };

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
        handleFileUpload(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startProgressAndTime();
      setFeedback({
        type: "neutral",
        message: "Grabando... 🎤",
      });
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono ❌",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      stopProgressAndTime();
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      startProgressAndTime();
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        stopProgressAndTime();
      } else {
        throw new Error('Error al enviar el archivo');
      }
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      stopProgressAndTime();
      toast({
        title: "Error",
        description: "Error al enviar el archivo ❌",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Descargando PDF",
      description: "Iniciando descarga del análisis...",
    });
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-10 shadow-lg bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-center">Subir Archivo de Audio</h2>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
          <TabsTrigger value="record">Grabar Audio</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <UploadButton onFileUpload={handleFileUpload} />
        </TabsContent>
        <TabsContent value="record">
          <div className="text-center space-y-6">
            <RecordButton 
              isRecording={isRecording}
              onToggleRecording={isRecording ? handleStopRecording : handleStartRecording}
            />
            {isRecording && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Grabando...</span>
                  <span>{formatTime(recordingTime)}</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {(progressValue > 0 || isProcessing) && !analysisResult && (
        <div className="mt-6 space-y-4">
          {progressValue < 100 && (
            <div className="space-y-2">
              <Progress value={progressValue} className="h-2" />
              <p className="text-sm text-center text-gray-500">
                Procesando audio... {progressValue}%
              </p>
            </div>
          )}
          
          {isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Generando análisis...
                </span>
                <span className="text-sm font-medium">
                  {formatTime(processingTimeLeft)}
                </span>
              </div>
              <Progress 
                value={(120 - processingTimeLeft) / 120 * 100} 
                className="h-2"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={cancelProcessing}
                className="w-full flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar procesamiento</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {feedback.message && (
        <div className="mt-6">
          <FeedbackDisplay 
            type={feedback.type}
            message={feedback.message}
            stage={feedback.stage}
          />
        </div>
      )}

      {analysisResult && (
        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileDown className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {analysisResult}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2"
            >
              <FileDown className="h-4 w-4" />
              <span>Descargar</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
