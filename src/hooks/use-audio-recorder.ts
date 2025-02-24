
import { useState, useRef } from "react";
import { useToast } from "./use-toast";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";
import { convertWebmToMp3 } from "../utils/audioConverter";

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
      
      console.log('🎙️ Iniciando proceso de grabación...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('🎤 Stream de audio obtenido:', {
        tracks: stream.getAudioTracks().length,
        settings: stream.getAudioTracks()[0].getSettings()
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📦 Chunk de audio recibido:', {
            tipo: event.data.type,
            tamaño: event.data.size + ' bytes'
          });
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(1000);
      console.log('⚡ MediaRecorder iniciado con configuración:', {
        mimeType: mediaRecorderRef.current.mimeType,
        estado: mediaRecorderRef.current.state
      });

      setIsRecording(true);
      startProgressAndTime();

    } catch (error) {
      console.error("❌ Error al iniciar la grabación:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la grabación de audio ❌",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Deteniendo grabación...');
      return new Promise<File>(async (resolve) => {
        mediaRecorderRef.current!.onstop = async () => {
          try {
            console.log('🎯 Grabación detenida. Chunks recolectados:', audioChunksRef.current.length);
            
            // Crear el blob de WebM inicial
            const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            console.log('🎵 Audio WebM creado:', {
              tipo: webmBlob.type,
              tamaño: (webmBlob.size / 1024).toFixed(2) + ' KB'
            });
            
            // Convertir WebM a WAV
            console.log('🔄 Iniciando conversión a WAV...');
            const wavBlob = await convertWebmToMp3(webmBlob);
            console.log('✅ Audio convertido a WAV:', {
              tipo: wavBlob.type,
              tamaño: (wavBlob.size / 1024).toFixed(2) + ' KB'
            });
            
            // Crear el archivo final
            const file = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
            console.log('📄 Archivo WAV creado y listo para subir');
            resolve(file);
            
          } catch (error) {
            console.error('❌ Error al procesar el audio:', error);
            toast({
              title: "Error",
              description: "Error al procesar el audio ❌",
              variant: "destructive",
            });
          }
        };
        
        mediaRecorderRef.current!.stop();
        mediaRecorderRef.current!.stream.getTracks().forEach(track => {
          track.stop();
          console.log('🎚️ Pista de audio detenida:', track.label);
        });
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
