
import { useState } from "react";
import { useToast } from "./use-toast";
import { uploadToSupabase } from "../utils/uploadUtils";

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/fdfea2uux2sa7todteplybdudo45qpwm';

export const useAudioUpload = () => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      // Convertir el archivo a Blob para Supabase
      const audioBlob = new Blob([file], { type: file.type });
      
      // Subir a Supabase y obtener la URL
      const publicUrl = await uploadToSupabase(audioBlob);
      
      if (publicUrl) {
        // Si tenemos la URL de Supabase, enviamos a Make
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
