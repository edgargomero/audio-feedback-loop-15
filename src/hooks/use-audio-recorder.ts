
import { useRef, useState } from "react";
import { useToast } from "./use-toast";
import { RECORDING_TIMEOUT } from "../types/feedback";

interface UseAudioRecorderProps {
  onRecordingComplete: (data: Blob) => void;
  onRecordingTimeout: () => void;
}

export const useAudioRecorder = ({ onRecordingComplete, onRecordingTimeout }: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const recordingStartTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const checkTimeIntervalRef = useRef<NodeJS.Timeout>();

  const checkRecordingTime = () => {
    if (recordingStartTimeRef.current) {
      const currentTime = Date.now();
      if (currentTime - recordingStartTimeRef.current >= RECORDING_TIMEOUT) {
        onRecordingTimeout();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      recordingStartTimeRef.current = Date.now();
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (checkTimeIntervalRef.current) {
          clearInterval(checkTimeIntervalRef.current);
        }

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          onRecordingComplete(audioBlob);
        }
        audioChunksRef.current = [];
      };

      checkTimeIntervalRef.current = setInterval(checkRecordingTime, 1000);
      
      mediaRecorder.start(1000);
      setIsRecording(true);

    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No hay micrófono ❌",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};
