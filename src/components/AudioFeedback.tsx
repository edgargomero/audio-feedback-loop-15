
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { Mic, Square } from "lucide-react";
import { useConversation } from "@11labs/react";
import { SalesAnalysis } from "../types/sales";
import { FeedbackState, APP_VERSION } from "../types/feedback";
import { useAudioRecorder } from "../hooks/use-audio-recorder";
import { FeedbackDisplay } from "./FeedbackDisplay";

export const AudioFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: "neutral",
    message: "Listo 👋",
  });
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const analysisPendingRef = useRef(false);

  useEffect(() => {
    console.log("Version actual:", APP_VERSION);
  }, []);

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
      setIsConnected(false);
      toast({
        title: "Error",
        description: "❌ Error de conexión",
        variant: "destructive",
      });
    },
    onConnect: () => {
      console.log("Conexión establecida");
      setIsConnected(true);
      setFeedback({
        type: "positive",
        message: "Conectado ✅",
      });
    },
    onDisconnect: () => {
      console.log("Desconectado de ElevenLabs");
      setIsConnected(false);
      // Intentar reconectar si hay un análisis pendiente
      if (analysisPendingRef.current) {
        handleStartRecording();
      }
    }
  });

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!isConnected && !analysisPendingRef.current) {
      // Si no está conectado, intentar reconectar
      analysisPendingRef.current = true;
      await handleStartRecording();
      return;
    }
    analysisPendingRef.current = false;
  };

  const { isRecording, startRecording, stopRecording } = useAudioRecorder({
    onRecordingComplete: handleRecordingComplete,
    onRecordingTimeout: () => {
      analysisPendingRef.current = false;
      toast({
        title: "Información",
        description: "Tiempo de grabación excedido",
      });
    }
  });

  const handleStartRecording = async () => {
    if (!isRecording) {
      try {
        await conversation.startSession({
          agentId: "DnScXfRTfQyBlJMBhfKb",
        });
        startRecording();
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        toast({
          title: "Error",
          description: "Error al conectar con el servicio ❌",
          variant: "destructive",
        });
      }
    } else {
      stopRecording();
    }
  };

  const analyzeSalesStage = (analysis: Partial<SalesAnalysis>) => {
    if (!analysis.stage) return;

    let feedbackType: FeedbackState["type"] = "neutral";
    let message = "";

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

  return (
    <Card className="p-6 max-w-md mx-auto mt-10 shadow-lg">
      <div className="space-y-6">
        <div className="flex justify-center">
          <Button
            onClick={handleStartRecording}
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

        <FeedbackDisplay feedback={feedback} />

        {isRecording && (
          <div className="text-center text-sm text-gray-500">
            🎤 Grabando...
          </div>
        )}

        <div className="text-center text-xs text-gray-400">
          v{APP_VERSION}
        </div>
      </div>
    </Card>
  );
};
