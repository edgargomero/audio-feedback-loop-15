
import { useState } from "react";
import { useToast } from "./use-toast";
import { uploadToSupabase } from "../utils/uploadUtils";
import { MAKE_WEBHOOK_URL } from "@/utils/constants";

export const useAudioUpload = () => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      const audioBlob = new Blob([file], { type: file.type });
      const publicUrl = await uploadToSupabase(audioBlob);
      
      if (publicUrl) {
        const formData = new FormData();
        formData.append('audioUrl', publicUrl);
        
        const response = await fetch(MAKE_WEBHOOK_URL, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          setTimeout(() => {
            setAnalysisResult(publicUrl.split('/').pop() || "analysis_result.pdf");
            toast({
              title: "¡Análisis completado!",
              description: "Audio analizado correctamente ✅",
            });
          }, 2000);
        } else {
          throw new Error('Error al procesar el audio');
        }
      }
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      toast({
        title: "Error",
        description: "Error al procesar el archivo ❌",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (analysisResult) {
      toast({
        title: "Descargando archivo",
        description: "Iniciando descarga del audio...",
      });
      window.open(analysisResult, '_blank');
    }
  };

  return {
    analysisResult,
    handleFileUpload,
    handleDownloadPDF,
  };
};
