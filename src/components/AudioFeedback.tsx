
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { Mic, Square } from "lucide-react";
import { useConversation } from "@11labs/react";

interface FeedbackState {
  type: "positive" | "neutral" | "negative";
  message: string;
}

export const AudioFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: "neutral",
    message: "Listo para comenzar",
  });
  const { toast } = useToast();
  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      
      // Analizar el mensaje y actualizar el feedback
      if (message.type === "agent_response") {
        analyzeFeedback(message.content);
      }
    },
    onError: (error) => {
      console.error("Error en la conversación:", error);
      toast({
        title: "Error",
        description: "Hubo un error en la conversación",
        variant: "destructive",
      });
    },
    onConnect: () => {
      console.log("Conexión establecida");
      setFeedback({
        type: "positive",
        message: "Conexión establecida correctamente",
      });
    },
    onDisconnect: () => {
      console.log("Desconectado");
      setIsRecording(false);
      setFeedback({
        type: "neutral",
        message: "Conversación finalizada",
      });
    }
  });

  const analyzeFeedback = (content: string) => {
    // Ejemplo simple de análisis - esto se puede hacer más sofisticado
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("bien") || lowerContent.includes("excelente")) {
      setFeedback({
        type: "positive",
        message: "¡Buen progreso! Continúa así",
      });
    } else if (lowerContent.includes("mejorar") || lowerContent.includes("cuidado")) {
      setFeedback({
        type: "negative",
        message: "Considera ajustar tu enfoque",
      });
    } else {
      setFeedback({
        type: "neutral",
        message: content,
      });
    }
  };

  const handleStartRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setFeedback({
        type: "neutral",
        message: "Iniciando grabación...",
      });
      
      conversation.startSession({
        agentId: "your-agent-id", // Reemplazar con el ID real del agente
      });
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    conversation.endSession();
  };

  const getFeedbackColor = (type: FeedbackState["type"]) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-10 shadow-lg">
      <div className="space-y-6">
        <div className="flex justify-center">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            variant={isRecording ? "destructive" : "default"}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isRecording ? "recording-pulse" : ""
            }`}
          >
            {isRecording ? (
              <Square className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
        </div>

        <div
          className={`p-4 rounded-lg feedback-transition ${getFeedbackColor(
            feedback.type
          )}`}
        >
          <p className="text-center font-medium">{feedback.message}</p>
        </div>

        {isRecording && (
          <div className="text-center text-sm text-gray-500">
            Grabando... Haz clic en el botón para detener
          </div>
        )}
      </div>
    </Card>
  );
};
