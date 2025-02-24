
import { useSalesAnalysis } from "./use-sales-analysis";
import { useToast } from "./use-toast";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";

export const useAudioUpload = () => {
  const { setFeedback } = useSalesAnalysis();
  const { toast } = useToast();

  const handleFileUpload = async (
    file: File, 
    sessionActive: boolean,
    startSession: () => Promise<boolean>,
    startProcessing: () => void
  ) => {
    if (!sessionActive) {
      const sessionStarted = await startSession();
      if (!sessionStarted) return;
    }

    try {
      setFeedback({
        type: "neutral",
        message: "Subiendo archivo... 📤",
        stage: 1
      });
      
      const audioBlob = new Blob([file], { type: file.type });
      const publicUrl = await uploadToSupabase(audioBlob);
      
      if (!publicUrl) {
        throw new Error('Error al obtener la URL pública');
      }
      
      const webhookSuccess = await sendToMakeWebhook(publicUrl, false);
      
      if (!webhookSuccess) {
        throw new Error('Error al procesar en Make');
      }

      setFeedback({
        type: "positive",
        message: "Archivo enviado a procesar... ⚙️",
        stage: 1
      });
      
      startProcessing();

    } catch (error) {
      console.error("Error en el proceso de subida:", error);
      setFeedback({
        type: "negative",
        message: "Error en el proceso ❌",
        stage: 1
      });
      toast({
        title: "Error",
        description: "Error al procesar el archivo ❌",
        variant: "destructive",
      });
    }
  };

  return { handleFileUpload };
};

