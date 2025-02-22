
import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { useConversation } from "@11labs/react";
import { SalesAnalysis } from "../types/sales";
import { RecordButton } from "./audio/RecordButton";
import { ExtraRecordButton } from "./audio/ExtraRecordButton";
import { FeedbackDisplay } from "./audio/FeedbackDisplay";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";

export const AudioFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingExtra, setIsRecordingExtra] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { feedback, setFeedback, analyzeSalesStage, analyzeFeedback } = useSalesAnalysis();

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
      setIsRecording(false);
      setFeedback({
        type: "neutral",
        message: "Fin 👋",
      });
    }
  });

  const handleStartRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
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
    setIsRecording(false);
    conversation.endSession();
  };

  const handleExtraRecording = async () => {
    if (!isRecordingExtra) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Aquí podrías enviar el audioBlob al servidor o procesarlo
          console.log("Audio grabado disponible en:", audioUrl);
          
          toast({
            title: "Guardado",
            description: "Audio grabado y listo para procesar",
          });
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
      // Aquí podrías procesar el archivo MP3
      console.log("Archivo MP3 recibido:", file);
      
      toast({
        title: "Archivo recibido",
        description: `${file.name} listo para procesar`,
      });

      // Aquí podrías enviar el archivo al servidor o procesarlo
      const audioUrl = URL.createObjectURL(file);
      console.log("Audio del archivo disponible en:", audioUrl);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      toast({
        title: "Error",
        description: "Error al procesar el archivo ❌",
        variant: "destructive",
      });
    }
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
            onFileUpload={handleFileUpload}
          />
        </div>

        <FeedbackDisplay 
          type={feedback.type}
          message={feedback.message}
          stage={feedback.stage}
        />

        {(isRecording || isRecordingExtra) && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            🎤 Grabando...
          </div>
        )}
      </div>
    </Card>
  );
};
