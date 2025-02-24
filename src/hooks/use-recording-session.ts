
import { useState, useEffect } from 'react';
import { useConversation } from "@11labs/react";
import { setConversationId } from "../utils/conversationState";
import { useToast } from "./use-toast";

export const useRecordingSession = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
    },
    onError: (error) => {
      console.error("Error en la conversación:", error);
      toast({
        title: "Error",
        description: "Error de conexión con el agente",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    return () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
      clearConversationId();
    };
  }, [sessionTimer]);

  const startSession = async () => {
    try {
      const conversationId = await conversation.startSession({
        agentId: "0gLnzcbTHPrgMkiYcNFr",
      });
      
      // Guardamos el ID global sin modificar
      setConversationId(conversationId);
      
      // Guardamos el id_conversation_medio para el webhook
      localStorage.setItem('id_conversation_medio', conversationId);
      
      setSessionActive(true);

      const timer = setTimeout(() => {
        endSession();
      }, 120000);

      setSessionTimer(timer);
      return true;
    } catch (error) {
      console.error("Error al iniciar la sesión:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión",
        variant: "destructive",
      });
      return false;
    }
  };

  const endSession = () => {
    setSessionActive(false);
    clearConversationId();
    localStorage.removeItem('id_conversation_medio');
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
    toast({
      title: "Sesión finalizada",
      description: "La sesión de 120 segundos ha terminado",
    });
  };

  return {
    sessionActive,
    startSession,
    endSession
  };
};

