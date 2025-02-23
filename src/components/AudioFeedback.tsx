
import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { RecordButton } from "./audio/RecordButton";
import { UploadButton } from "./audio/UploadButton";
import { FeedbackDisplay } from "./audio/FeedbackDisplay";
import { ProcessingCountdown } from "./audio/ProcessingCountdown";
import { ProgressIndicator } from "./audio/ProgressIndicator";
import { AnalysisResult } from "./audio/AnalysisResult";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";

export const AudioFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeLeft, setProcessingTimeLeft] = useState(120);
  const progressInterval = useRef<NodeJS.Timeout>();
  const timeInterval = useRef<NodeJS.Timeout>();
  const processingInterval = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { feedback, setFeedback } = useSalesAnalysis();

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
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (timeInterval.current) clearInterval(timeInterval.current);
    setProgressValue(100);
  };

  const cancelProcessing = () => {
    if (processingInterval.current) clearInterval(processingInterval.current);
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
      setFeedback({
        type: "neutral",
        message: "Subiendo archivo... 📤",
      });
      
      startProgressAndTime();
      
      // Convertir File a Blob para subir a Supabase
      const audioBlob = new Blob([file], { type: file.type });
      const publicUrl = await uploadToSupabase(audioBlob);
      
      if (!publicUrl) {
        throw new Error('Error al obtener la URL pública');
      }

      setFeedback({
        type: "positive",
        message: "Archivo subido exitosamente, procesando... ⚙️",
      });

      // Enviar la URL al webhook de Make
      const webhookSuccess = await sendToMakeWebhook(publicUrl);
      
      if (!webhookSuccess) {
        throw new Error('Error al procesar en Make');
      }

      stopProgressAndTime();
      startProcessingCountdown();

      setFeedback({
        type: "positive",
        message: "¡Archivo procesado correctamente! 🎉",
      });

    } catch (error) {
      console.error("Error en el proceso de subida:", error);
      stopProgressAndTime();
      setFeedback({
        type: "negative",
        message: "Error en el proceso ❌",
      });
      toast({
        title: "Error",
        description: "Error al procesar el archivo ❌",
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
              onToggleRecording={
                isRecording 
                  ? handleStopRecording 
                  : handleStartRecording
              }
            />
            {isRecording && (
              <ProgressIndicator value={progressValue} time={recordingTime} />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {(progressValue > 0 || isProcessing) && !analysisResult && (
        <div className="mt-6 space-y-4">
          {progressValue < 100 && (
            <ProgressIndicator value={progressValue} />
          )}
          
          {isProcessing && (
            <ProcessingCountdown 
              timeLeft={processingTimeLeft}
              onCancel={cancelProcessing}
            />
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
        <div className="mt-6">
          <AnalysisResult
            filename={analysisResult}
            onDownload={handleDownloadPDF}
          />
        </div>
      )}
    </Card>
  );
};
