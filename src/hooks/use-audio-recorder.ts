
import { useState, useRef } from "react";
import { useToast } from "./use-toast";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();
  const timeInterval = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSupportedMimeType = (): string | null => {
    const mimeTypes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
    ];

    return mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || null;
  };

  const handleStartRecording = async (startSession: () => Promise<boolean>) => {
    try {
      const sessionStarted = await startSession();
      if (!sessionStarted) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const supportedType = getSupportedMimeType();
      if (!supportedType) {
        throw new Error('No se encontró ningún formato de audio soportado');
      }

      console.log('Formato de audio seleccionado:', supportedType);
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: supportedType
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      startProgressAndTime();

    } catch (error) {
      console.error("Error al iniciar la grabación:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la grabación de audio ❌",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      return new Promise<File>((resolve) => {
        mediaRecorderRef.current!.onstop = async () => {
          const mimeType = mediaRecorderRef.current!.mimeType;
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const extension = mimeType.split('/')[1];
          const file = new File([audioBlob], `recording.${extension}`, { type: mimeType });
          resolve(file);
        };
        
        mediaRecorderRef.current!.stop();
        mediaRecorderRef.current!.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        stopProgressAndTime();
      });
    }
    return Promise.reject('No hay grabación activa');
  };

  const startProgressAndTime = () => {
    setProgressValue(0);
    setRecordingTime(0);
    
    progressInterval.current = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          return 100;
        }
        return prev + 1;
      });
    }, 1200);

    timeInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopProgressAndTime = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (timeInterval.current) clearInterval(timeInterval.current);
    setProgressValue(100);
  };

  return {
    isRecording,
    progressValue,
    recordingTime,
    formatTime,
    handleStartRecording,
    handleStopRecording,
  };
};

