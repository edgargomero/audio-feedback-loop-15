
import { Card } from "./ui/card";
import { Tabs } from "./ui/tabs";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { useAudioRecorderState } from "../hooks/use-audio-recorder-state";
import { startProcessingCountdown } from "../utils/progressUtils";
import { useState } from "react";
import { TabsSection } from "./audio/TabsSection";
import { ProcessingSection } from "./audio/ProcessingSection";
import { ResultSection } from "./audio/ResultSection";
import { useRecordingSession } from "../hooks/use-recording-session";
import { useAudioRecorder } from "../hooks/use-audio-recorder";
import { useAudioUpload } from "../hooks/use-audio-upload";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";

export const AudioFeedback = () => {
  const { feedback, setFeedback } = useSalesAnalysis();
  const { sessionActive, startSession } = useRecordingSession();
  const {
    state,
    setters,
    refs,
    toast
  } = useAudioRecorderState();
  const [evaluationHtml, setEvaluationHtml] = useState<string | null>(null);
  const { handleFileUpload: handleUpload } = useAudioUpload();
  const { 
    handleStartRecording, 
    handleStopRecording 
  } = useAudioRecorder();

  const cancelProcessing = () => {
    if (refs.processingInterval.current) clearInterval(refs.processingInterval.current);
    setters.setIsProcessing(false);
    setters.setProgressValue(0);
    toast({
      title: "Procesamiento cancelado",
      description: "Se ha cancelado el procesamiento del audio",
    });
  };

  const startProcessing = () => {
    startProcessingCountdown(
      setters.setIsProcessing,
      setters.setProcessingTimeLeft,
      refs.processingInterval,
      (result) => {
        if (typeof result === 'string' && result.includes('<!DOCTYPE html>')) {
          setEvaluationHtml(result);
          setters.setAnalysisResult(null);
        } else {
          setters.setAnalysisResult(result);
        }
      }
    );
  };

  const handleDownloadPDF = () => {
    if (!state.analysisResult) {
      toast({
        title: "Error",
        description: "No hay análisis disponible",
        variant: "destructive",
      });
      return;
    }

    if (typeof state.analysisResult === 'object' && state.analysisResult !== null) {
      const result = state.analysisResult as { url: string };
      
      if ('url' in result) {
        console.log('📥 Descargando PDF desde:', result.url);
        window.open(result.url, '_blank');
        toast({
          title: "Descargando PDF",
          description: "El PDF se abrirá en una nueva pestaña",
        });
        return;
      }
    }
    
    toast({
      title: "Error",
      description: "No se encontró la URL del PDF",
      variant: "destructive",
    });
  };

  const onToggleRecording = async () => {
    if (state.isRecording) {
      const audioFile = await handleStopRecording();
      if (audioFile) {
        const publicUrl = await uploadToSupabase(audioFile);
        if (publicUrl) {
          await sendToMakeWebhook(publicUrl, true);
          startProcessing();
        }
      }
    } else {
      await handleStartRecording(startSession);
    }
  };

  const onFileUpload = (file: File) => {
    handleUpload(file);
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-10 shadow-lg bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-center">Subir Archivo de Audio</h2>
      <Tabs defaultValue="upload" className="w-full">
        <TabsSection 
          isRecording={state.isRecording}
          onToggleRecording={onToggleRecording}
          progressValue={state.progressValue}
          recordingTime={state.recordingTime}
          onFileUpload={onFileUpload}
        />
      </Tabs>

      {(state.progressValue > 0 || state.isProcessing) && !state.analysisResult && !evaluationHtml && (
        <ProcessingSection 
          progressValue={state.progressValue}
          isProcessing={state.isProcessing}
          processingTimeLeft={state.processingTimeLeft}
          onCancel={cancelProcessing}
        />
      )}

      <ResultSection 
        feedback={feedback}
        evaluationHtml={evaluationHtml}
        analysisResult={state.analysisResult}
        onDownload={handleDownloadPDF}
      />
    </Card>
  );
};
