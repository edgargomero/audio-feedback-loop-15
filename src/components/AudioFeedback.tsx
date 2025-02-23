
import { Card } from "./ui/card";
import { UploadButton } from "./audio/UploadButton";
import { FeedbackDisplay } from "./audio/FeedbackDisplay";
import { ProcessingCountdown } from "./audio/ProcessingCountdown";
import { ProgressIndicator } from "./audio/ProgressIndicator";
import { AnalysisResult } from "./audio/AnalysisResult";
import { RecordingControls } from "./audio/RecordingControls";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAudioRecorderState } from "../hooks/use-audio-recorder-state";
import { startProgressAndTime, stopProgressAndTime, startProcessingCountdown } from "../utils/progressUtils";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";

export const AudioFeedback = () => {
  const { feedback, setFeedback } = useSalesAnalysis();
  const {
    state,
    setters,
    refs,
    toast
  } = useAudioRecorderState();

  const cancelProcessing = () => {
    if (refs.processingInterval.current) clearInterval(refs.processingInterval.current);
    setters.setIsProcessing(false);
    setters.setProgressValue(0);
    toast({
      title: "Procesamiento cancelado",
      description: "Se ha cancelado el procesamiento del audio",
    });
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.mediaRecorderRef.current = new MediaRecorder(stream);
      state.audioChunksRef.current = [];

      state.mediaRecorderRef.current.ondataavailable = (event) => {
        state.audioChunksRef.current.push(event.data);
      };

      state.mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(state.audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        handleFileUpload(file);
      };

      state.mediaRecorderRef.current.start();
      setters.setIsRecording(true);
      startProgressAndTime(
        setters.setProgressValue,
        setters.setRecordingTime,
        refs.progressInterval,
        refs.timeInterval
      );
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
    if (state.mediaRecorderRef.current && state.isRecording) {
      state.mediaRecorderRef.current.stop();
      state.mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setters.setIsRecording(false);
      stopProgressAndTime(
        refs.progressInterval,
        refs.timeInterval,
        setters.setProgressValue
      );
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setFeedback({
        type: "neutral",
        message: "Subiendo archivo... 📤",
      });
      
      startProgressAndTime(
        setters.setProgressValue,
        setters.setRecordingTime,
        refs.progressInterval,
        refs.timeInterval
      );
      
      const audioBlob = new Blob([file], { type: file.type });
      const publicUrl = await uploadToSupabase(audioBlob);
      
      if (!publicUrl) {
        throw new Error('Error al obtener la URL pública');
      }

      setFeedback({
        type: "positive",
        message: "Archivo subido exitosamente, procesando... ⚙️",
      });

      const webhookSuccess = await sendToMakeWebhook(publicUrl);
      
      if (!webhookSuccess) {
        throw new Error('Error al procesar en Make');
      }

      stopProgressAndTime(
        refs.progressInterval,
        refs.timeInterval,
        setters.setProgressValue
      );
      
      startProcessingCountdown(
        setters.setIsProcessing,
        setters.setProcessingTimeLeft,
        refs.processingInterval,
        setters.setAnalysisResult,
        toast
      );

      setFeedback({
        type: "positive",
        message: "¡Archivo procesado correctamente! 🎉",
      });

    } catch (error) {
      console.error("Error en el proceso de subida:", error);
      stopProgressAndTime(
        refs.progressInterval,
        refs.timeInterval,
        setters.setProgressValue
      );
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
          <RecordingControls 
            isRecording={state.isRecording}
            onToggleRecording={state.isRecording ? handleStopRecording : handleStartRecording}
            progressValue={state.progressValue}
            recordingTime={state.recordingTime}
          />
        </TabsContent>
      </Tabs>

      {(state.progressValue > 0 || state.isProcessing) && !state.analysisResult && (
        <div className="mt-6 space-y-4">
          {state.progressValue < 100 && (
            <ProgressIndicator value={state.progressValue} />
          )}
          
          {state.isProcessing && (
            <ProcessingCountdown 
              timeLeft={state.processingTimeLeft}
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

      {state.analysisResult && (
        <div className="mt-6">
          <AnalysisResult
            filename={state.analysisResult}
            onDownload={handleDownloadPDF}
          />
        </div>
      )}
    </Card>
  );
};
