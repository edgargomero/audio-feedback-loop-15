
import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@11labs/react";
import { RecordButton } from "./audio/RecordButton";
import { ExtraRecordButton } from "./audio/ExtraRecordButton";
import { UploadButton } from "./audio/UploadButton";
import { FeedbackDisplay } from "./audio/FeedbackDisplay";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { Progress } from "./ui/progress";
import { uploadToSupabase } from "../utils/uploadUtils";

export const AudioFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingExtra, setIsRecordingExtra] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();
  const timeInterval = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { feedback, setFeedback, analyzeSalesStage, analyzeFeedback } = useSalesAnalysis();

  const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/fdfea2uux2sa7todteplybdudo45qpwm';

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      
      if (message.type === "agent_response") {
        try {
          const analysis = JSON.parse(message.content);
          analyzeSalesStage(analysis);
        } catch (e) {
          analyzeFeedback(message.content);
        }
      }
    },
    onError: (error) => {
      console.error("Error en la conversación:", error);
      toast({
        title: "Error",
        description: "❌ Error de conexión",
        variant: "destructive",
      });
    },
    onConnect: () => {
      console.log("Conexión establecida");
      setFeedback({
        type: "positive",
        message: "Conectado ✅",
      });
    },
    onDisconnect: () => {
      console.log("Desconectado");
      stopProgressAndTime();
      setIsRecording(false);
      setFeedback({
        type: "neutral",
        message: "Fin 👋",
      });
    }
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (timeInterval.current) {
      clearInterval(timeInterval.current);
    }
    setProgressValue(100);
  };

  const handleStartRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      startProgressAndTime();
      setFeedback({
        type: "neutral",
        message: "Iniciando... 🎤",
      });
      
      conversation.startSession({
        agentId: "DnScXfRTfQyBlJMBhfKb",
      });
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No hay micrófono ❌",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    stopProgressAndTime();
    setIsRecording(false);
    conversation.endSession();
    toast({
      title: "¡Análisis completado!",
      description: "Procesando resultados... ✅",
    });
  };

  const handleExtraRecording = async () => {
    if (!isRecordingExtra) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        startProgressAndTime();

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          stopProgressAndTime();
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          const publicUrl = await uploadToSupabase(audioBlob);
          
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.mp3');
          
          if (publicUrl) {
            toast({
              title: "¡Análisis completado!",
              description: "Audio enviado correctamente ✅",
            });
          })
          .catch(error => {
            console.error('Error al enviar a Make:', error);
            toast({
              title: "Error",
              description: "Error al enviar el audio a Make",
              variant: "destructive",
              title: "URL del archivo",
              description: publicUrl,
            });
          }
        };

        mediaRecorder.start();
        setIsRecordingExtra(true);
        toast({
          title: "Grabando",
          description: "Grabando audio adicional...",
        });
      } catch (error) {
        console.error("Error al acceder al micrófono:", error);
        toast({
          title: "Error",
          description: "No hay micrófono ❌",
          variant: "destructive",
        });
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      setIsRecordingExtra(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      startProgressAndTime();
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        stopProgressAndTime();
        toast({
          title: "¡Análisis completado!",
          description: "Audio procesado correctamente ✅",
        });
      } else {
        throw new Error('Error al enviar el archivo');
      }
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      stopProgressAndTime();
      toast({
        title: "Error",
        description: "Error al enviar el archivo a Make ❌",
        variant: "destructive",
      });
    }
  };

  const getProgressColor = (value: number): string => {
    if (value < 30) return "from-blue-500 to-blue-600";
    if (value < 70) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-10 shadow-lg bg-white dark:bg-gray-800">
      <div className="space-y-6">
        <div className="flex justify-center gap-4">
          <RecordButton 
            isRecording={isRecording}
            onToggleRecording={isRecording ? handleStopRecording : handleStartRecording}
          />
          <ExtraRecordButton 
            isRecording={isRecordingExtra}
            onToggleRecording={handleExtraRecording}
          />
          <UploadButton onFileUpload={handleFileUpload} />
        </div>

        {(isRecording || isRecordingExtra) && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Grabando...</span>
              <span>{formatTime(recordingTime)}</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full transition-all duration-300 bg-gradient-to-r ${getProgressColor(progressValue)}`}
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        )}

        <FeedbackDisplay 
          type={feedback.type}
          message={feedback.message}
          stage={feedback.stage}
        />
      </div>
    </Card>
  );
};
