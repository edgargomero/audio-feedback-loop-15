
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { Mic, Square, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";
import { useConversation } from "@11labs/react";
import { SalesAnalysis, SalesStage, SALES_STAGES } from "../types/sales";

interface FeedbackState {
  type: "positive" | "neutral" | "negative";
  message: string;
  stage?: SalesStage;
  analysis?: Partial<SalesAnalysis>;
}

export const AudioFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: "neutral",
    message: "Listo 👋",
  });
  const { toast } = useToast();

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

  const analyzeSalesStage = (analysis: Partial<SalesAnalysis>) => {
    if (!analysis.stage) return;

    const stage = SALES_STAGES[analysis.stage];
    let feedbackType: FeedbackState["type"] = "neutral";
    let message = "";

    // Mensajes concisos por etapa con emojis
    switch (analysis.stage) {
      case 1:
        if (analysis.matchScore && analysis.matchScore > 0.8) {
          message = "Buen match! 🤝";
          feedbackType = "positive";
        } else {
          message = "Más rapport 🎯";
          feedbackType = "negative";
        }
        break;
      case 2:
        if (analysis.needsIdentified?.length) {
          message = `${analysis.needsIdentified.length} necesidades ✅`;
          feedbackType = "positive";
        } else {
          message = "Indaga más 🔍";
          feedbackType = "neutral";
        }
        break;
      case 3:
        if (analysis.brandValues) {
          message = "Valores ✨";
          feedbackType = "positive";
        } else {
          message = "Resalta marca ⭐";
          feedbackType = "neutral";
        }
        break;
      case 4:
        if (analysis.closingTechnique) {
          message = "¡Cierra! 🎯";
          feedbackType = "positive";
        } else {
          message = "Busca cierre 🎯";
          feedbackType = "neutral";
        }
        break;
    }

    setFeedback({
      type: feedbackType,
      message,
      stage: analysis.stage,
      analysis
    });
  };

  const analyzeFeedback = (content: string) => {
    const lowerContent = content.toLowerCase();
    let feedbackState: FeedbackState = {
      type: "neutral",
      message: "Escuchando... 👂"
    };

    if (lowerContent.includes("match exitoso") || lowerContent.includes("buena conexión")) {
      feedbackState = {
        type: "positive",
        message: "Match! 🤝",
        stage: 1
      };
    } else if (lowerContent.includes("necesidad identificada")) {
      feedbackState = {
        type: "positive",
        message: "Necesidad ✅",
        stage: 2
      };
    } else if (lowerContent.includes("propuesta")) {
      feedbackState = {
        type: "neutral",
        message: "Propuesta 💡",
        stage: 3
      };
    } else if (lowerContent.includes("cierre")) {
      feedbackState = {
        type: "positive",
        message: "¡Cierra! 🎯",
        stage: 4
      };
    }

    setFeedback(feedbackState);
  };

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

  const getFeedbackIcon = (type: FeedbackState["type"]) => {
    switch (type) {
      case "positive":
        return <ThumbsUp className="w-6 h-6" />;
      case "negative":
        return <ThumbsDown className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
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
          <div className="flex items-center justify-center space-x-2">
            {getFeedbackIcon(feedback.type)}
            <p className="text-center text-lg font-medium">{feedback.message}</p>
          </div>
          {feedback.stage && (
            <p className="text-center text-sm mt-2">
              Etapa {feedback.stage}
            </p>
          )}
        </div>

        {isRecording && (
          <div className="text-center text-sm text-gray-500">
            🎤 Grabando...
          </div>
        )}
      </div>
    </Card>
  );
};
