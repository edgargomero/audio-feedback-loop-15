
import { useState, useRef } from "react";
import { useToast } from "./use-toast";
import { useSalesAnalysis } from "./use-sales-analysis";

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
        mimeType: 'audio/webm'
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startProgressAndTime();

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
    if (mediaRecorderRef.current && isRecording) {
      return new Promise<File>((resolve) => {
        mediaRecorderRef.current!.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convertir WebM a MP3 usando un AudioContext
          const audioContext = new AudioContext();
          const audioBuffer = await audioBlob.arrayBuffer();
          const audioData = await audioContext.decodeAudioData(audioBuffer);
          
          // Crear un nuevo AudioBuffer para MP3
          const offlineContext = new OfflineAudioContext(
            audioData.numberOfChannels,
            audioData.length,
            audioData.sampleRate
          );
          
          const source = offlineContext.createBufferSource();
          source.buffer = audioData;
          source.connect(offlineContext.destination);
          source.start();
          
          const renderedBuffer = await offlineContext.startRendering();
          const mp3Blob = new Blob(
            [Int8Array.from(renderedBuffer.getChannelData(0))],
            { type: 'audio/mp3' }
          );
          
          const file = new File([mp3Blob], 'recording.mp3', { type: 'audio/mp3' });
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
    }, 100);

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
