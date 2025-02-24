
import { useState } from 'react';
import { useAudioRecorderState } from "../../hooks/use-audio-recorder-state";
import { startProgressAndTime, stopProgressAndTime } from "../../utils/progressUtils";
import { uploadToSupabase, sendToMakeWebhook } from "../../utils/uploadUtils";
import { useRecordingSession } from "../../hooks/use-recording-session";
import { SalesAnalysis } from "@/types/sales";

interface RecordingHandlerProps {
  onFeedbackChange: (feedback: SalesAnalysis) => void;
  onProcessingStart: () => void;
}

export const RecordingHandler = ({ onFeedbackChange, onProcessingStart }: RecordingHandlerProps) => {
  const { sessionActive, startSession } = useRecordingSession();
  const {
    state,
    setters,
    refs,
    toast
  } = useAudioRecorderState();

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

      state.mediaRecorderRef.current.onstop = async () => {
        try {
          if (state.audioChunksRef.current.length === 0) {
            throw new Error('No se grabó ningún audio');
          }

          const audioBlob = new Blob(state.audioChunksRef.current, { type: 'audio/webm' });
          
          onFeedbackChange({
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

          onFeedbackChange({
            type: "positive",
            message: "Grabación enviada a procesar... ⚙️",
            stage: 1
          });

          onProcessingStart();

        } catch (error) {
          console.error('Error al procesar la grabación:', error);
          onFeedbackChange({
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
      };

      state.mediaRecorderRef.current.start();
      setters.setIsRecording(true);
      startProgressAndTime(
        setters.setProgressValue,
        setters.setRecordingTime,
        refs.progressInterval,
        refs.timeInterval
      );
      onFeedbackChange({
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

  return {
    isRecording: state.isRecording,
    progressValue: state.progressValue,
    recordingTime: state.recordingTime,
    handleStartRecording,
    handleStopRecording
  };
};
