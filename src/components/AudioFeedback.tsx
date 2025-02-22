
import { useState } from "react";
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
        await navigator.mediaDevices.getUserMedia({ audio: true });
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
      setIsRecordingExtra(false);
      toast({
        title: "Guardado",
        description: "Audio adicional guardado para procesamiento posterior",
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
