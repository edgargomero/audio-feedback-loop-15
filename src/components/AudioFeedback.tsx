
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { Mic, Square } from "lucide-react";
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
    message: "Listo para comenzar",
  });
  const { toast } = useToast();

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      
      if (message.type === "agent_response") {
        try {
          // Intentamos parsear la respuesta como JSON
          const analysis = JSON.parse(message.content);
          analyzeSalesStage(analysis);
        } catch (e) {
          // Si no es JSON, tratamos como texto normal
          analyzeFeedback(message.content);
        }
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

  const analyzeSalesStage = (analysis: Partial<SalesAnalysis>) => {
    if (!analysis.stage) return;

    const stage = SALES_STAGES[analysis.stage];
    let feedbackType: FeedbackState["type"] = "neutral";
    let message = stage.name;

    // Análisis basado en múltiples factores
    if (analysis.matchScore && analysis.matchScore > 0.8) {
      feedbackType = "positive";
    } else if (analysis.matchScore && analysis.matchScore < 0.5) {
      feedbackType = "negative";
    }

    // Mensajes específicos por etapa
    switch (analysis.stage) {
      case 1:
        message = analysis.matchScore && analysis.matchScore > 0.8 
          ? "¡Buen match inicial! Continúa construyendo rapport" 
          : "Trabaja en establecer mejor conexión inicial";
        break;
      case 2:
        message = analysis.needsIdentified?.length 
          ? `Identificadas ${analysis.needsIdentified.length} necesidades` 
          : "Profundiza en las necesidades del cliente";
        break;
      case 3:
        message = analysis.brandValues 
          ? "Propuesta alineada con valores de marca" 
          : "Resalta más los valores de la marca";
        break;
      case 4:
        message = analysis.closingTechnique 
          ? `Técnica de cierre: ${analysis.closingTechnique}` 
          : "Busca oportunidad para cerrar";
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
      message: content
    };

    // Análisis básico de texto cuando no recibimos JSON estructurado
    if (lowerContent.includes("match exitoso") || lowerContent.includes("buena conexión")) {
      feedbackState.stage = 1;
      feedbackState.type = "positive";
    } else if (lowerContent.includes("necesidad identificada") || lowerContent.includes("cliente requiere")) {
      feedbackState.stage = 2;
      feedbackState.type = "positive";
    } else if (lowerContent.includes("propuesta") || lowerContent.includes("valor agregado")) {
      feedbackState.stage = 3;
      feedbackState.type = "neutral";
    } else if (lowerContent.includes("cierre") || lowerContent.includes("venta completada")) {
      feedbackState.stage = 4;
      feedbackState.type = "positive";
    }

    setFeedback(feedbackState);
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
        agentId: "DnScXfRTfQyBlJMBhfKb", // Agent ID actualizado
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
          {feedback.stage && (
            <p className="text-center text-sm mt-2">
              Etapa {feedback.stage}: {SALES_STAGES[feedback.stage].name}
            </p>
          )}
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
