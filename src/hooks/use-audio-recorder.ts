
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

  const handleStartRecording = async (startSession: () => Promise<boolean>) => {
    try {
      const sessionStarted = await startSession();
      if (!sessionStarted) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/wav'
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(1000); // Grabamos en chunks de 1 segundo
      setIsRecording(true);
      startProgressAndTime();

    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      // Si el formato WAV no es soportado, intentamos con otros formatos aceptados
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeTypes = [
          'audio/mp3',
          'audio/ogg',
          'audio/aac',
          'audio/m4a'
        ];
        
        // Encontrar el primer formato soportado
        const supportedType = mimeTypes.find(type => 
          MediaRecorder.isTypeSupported(type)
        );

        if (!supportedType) {
          throw new Error('Ningún formato de audio soportado');
        }

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

      } catch (fallbackError) {
        console.error("Error al intentar formatos alternativos:", fallbackError);
        toast({
          title: "Error",
          description: "No se pudo acceder al micrófono ❌",
          variant: "destructive",
        });
      }
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
    }, 1200); // Ajustado para que coincida con los 120 segundos totales

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
