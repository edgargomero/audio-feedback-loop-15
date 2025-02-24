
import { useState, useRef } from "react";
import { useToast } from "./use-toast";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";

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

  const getSupportedMimeType = (): string => {
    // Lista de formatos soportados por el backend, en orden de preferencia
    const preferredTypes = [
      'audio/wav',  // WAV
      'audio/mpeg', // MP3
      'audio/aac',  // AAC
      'audio/ogg',  // OGG
      'audio/mp4'   // M4A
    ];

    for (const type of preferredTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Formato de audio soportado encontrado:', type);
        return type;
      }
    }

    // Si ninguno de los formatos preferidos es soportado, intentamos variantes comunes
    const fallbackTypes = [
      'audio/webm;codecs=pcm',
      'audio/webm;codecs=opus'
    ];

    for (const type of fallbackTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Usando formato fallback:', type);
        return type;
      }
    }

    throw new Error('No se encontró ningún formato de audio soportado');
  };

  const handleStartRecording = async (startSession: () => Promise<boolean>) => {
    try {
      const sessionStarted = await startSession();
      if (!sessionStarted) return;

      const supportedType = getSupportedMimeType();
      console.log('Iniciando grabación con formato:', supportedType);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: supportedType,
        audioBitsPerSecond: 128000
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Chunk de audio recibido:', {
            tipo: event.data.type,
            tamaño: event.data.size
          });
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
          console.log('Finalizando grabación con formato:', mimeType);
          
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          // Determinar la extensión correcta basada en el tipo MIME
          let extension = 'wav'; // por defecto
          if (mimeType.includes('mpeg')) extension = 'mp3';
          else if (mimeType.includes('aac')) extension = 'aac';
          else if (mimeType.includes('ogg')) extension = 'ogg';
          else if (mimeType.includes('mp4')) extension = 'm4a';
          
          console.log('Usando extensión:', extension);
          
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
