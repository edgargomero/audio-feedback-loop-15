
import { useState } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "./use-toast";
import { setConversationId } from "@/utils/conversationState";

interface SessionResponse {
  conversation_id: string;
}

interface Message {
  text: string;
  isAgent: boolean;
  feedback?: { emoji: string; phrase: string };
}

const feedbacks = [
  { emoji: "👍", phrase: "¡Buen tono de voz!" },
  { emoji: "🎯", phrase: "Excelente explicación" },
  { emoji: "💡", phrase: "Punto clave identificado" }
];

export const useConversationHandler = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      if (message.source === "ai") {
        setMessages(prev => [...prev, {
          text: message.message,
          isAgent: true,
          feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)]
        }]);
      } else if (message.source === "user") {
        setMessages(prev => [...prev, {
          text: message.message,
          isAgent: false
        }]);
      }
    },
    onError: (error) => {
      console.error("Error en la conversación:", error);
      toast({
        title: "Error",
        description: "Error de conexión con el agente",
        variant: "destructive",
      });
    },
    onConnect: () => {
      console.log("Conexión establecida");
      setMessages([{
        text: "¡Hola! Soy tu agente de análisis. ¿En qué puedo ayudarte?",
        isAgent: true
      }]);
    },
  });

  const handleStartAgent = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const conversationId = await conversation.startSession({
        agentId: "0gLnzcbTHPrgMkiYcNFr",
      });
      
      const session: SessionResponse = {
        conversation_id: conversationId
      };
      
      setConversationId(session.conversation_id);
      return true;
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleStopAgent = () => {
    conversation.endSession();
  };

  return {
    messages,
    handleStartAgent,
    handleStopAgent
  };
};
