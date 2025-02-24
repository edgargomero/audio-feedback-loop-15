
import { Card } from "./ui/card";
import { Tabs } from "./ui/tabs";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { useAudioRecorderState } from "../hooks/use-audio-recorder-state";
import { startProcessingCountdown } from "../utils/progressUtils";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";
import { useState } from "react";
import { TabsSection } from "./audio/TabsSection";
import { ProcessingSection } from "./audio/ProcessingSection";
import { ResultSection } from "./audio/ResultSection";
import { useRecordingSession } from "../hooks/use-recording-session";
import { setConversationId } from "../utils/conversationState";

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

  const handleStartRecording = async () => {
    if (!sessionActive) {
      const sessionStarted = await startSession();
      if (!sessionStarted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.mediaRecorderRef.current = new MediaRecorder(stream);
      state.audioChunksRef.current = [];

      state.mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          state.audioChunksRef.current.push(event.data);
        }
      };

      state.mediaRecorderRef.current.start();
      setters.setIsRecording(true);
      setFeedback({
        type: "neutral",
        message: "Grabando... 🎤",
        stage: 1
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

  const handleStopRecording = async () => {
    if (state.mediaRecorderRef.current && state.isRecording) {
      state.mediaRecorderRef.current.stop();
      state.mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setters.setIsRecording(false);

      try {
        const audioBlob = new Blob(state.audioChunksRef.current, { type: 'audio/webm' });
        
        setFeedback({
          type: "neutral",
          message: "Subiendo grabación... 📤",
          stage: 1
        });

        const publicUrl = await uploadToSupabase(audioBlob);
        
        if (!publicUrl) {
          throw new Error('Error al obtener la URL pública');
        }
        
        const webhookSuccess = await sendToMakeWebhook(publicUrl, true);
        
        if (!webhookSuccess) {
          throw new Error('Error al procesar en Make');
        }

        setFeedback({
          type: "positive",
          message: "Grabación enviada a procesar... ⚙️",
          stage: 1
        });

        startProcessing();

      } catch (error) {
        console.error('Error al procesar la grabación:', error);
        setFeedback({
          type: "negative",
          message: "Error al procesar la grabación ❌",
          stage: 1
        });
        toast({
          title: "Error",
          description: "Error al procesar la grabación",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!sessionActive) {
      const sessionStarted = await startSession();
      if (!sessionStarted) return;
    }

    try {
      setFeedback({
        type: "neutral",
        message: "Subiendo archivo... 📤",
        stage: 1
      });
      
      const audioBlob = new Blob([file], { type: file.type });
      const publicUrl = await uploadToSupabase(audioBlob);
      
      if (!publicUrl) {
        throw new Error('Error al obtener la URL pública');
      }
      
      const webhookSuccess = await sendToMakeWebhook(publicUrl, false);
      
      if (!webhookSuccess) {
        throw new Error('Error al procesar en Make');
      }

      setFeedback({
        type: "positive",
        message: "Archivo enviado a procesar... ⚙️",
        stage: 1
      });
      
      startProcessing();

    } catch (error) {
      console.error("Error en el proceso de subida:", error);
      setFeedback({
        type: "negative",
        message: "Error en el proceso ❌",
        stage: 1
      });
      toast({
        title: "Error",
        description: "Error al procesar el archivo ❌",
        variant: "destructive",
      });
    }
  };

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
      },
      toast
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

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-10 shadow-lg bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-center">Subir Archivo de Audio</h2>
      <Tabs defaultValue="upload" className="w-full">
        <TabsSection 
          isRecording={state.isRecording}
          onToggleRecording={state.isRecording ? handleStopRecording : handleStartRecording}
          progressValue={state.progressValue}
          recordingTime={state.recordingTime}
          onFileUpload={handleFileUpload}
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

