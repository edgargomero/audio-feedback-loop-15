
import { useState } from "react";
import { useSalesAnalysis } from "./use-sales-analysis";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";
import { useAudioRecorderState } from "./use-audio-recorder-state";

export const useAudioRecorder = () => {
  const { setFeedback } = useSalesAnalysis();
  const { state, setters, toast } = useAudioRecorderState();

  const handleStartRecording = async (sessionActive: boolean, startSession: () => Promise<boolean>) => {
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

  const handleStopRecording = async (startProcessing: () => void) => {
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

  return {
    handleStartRecording,
    handleStopRecording
  };
};

