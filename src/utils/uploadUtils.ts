
import { supabase } from "../integrations/supabase/client";
import { toast } from "../hooks/use-toast";

export const uploadToSupabase = async (audioBlob: Blob) => {
  const BUCKET_NAME = import.meta.env.VITE_SUPABASE_BUCKET || "audio_chunks";
  
  try {
    const fileName = `recording-${Date.now()}.mp3`;
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, audioBlob);

    if (error) {
      throw error;
    }

    const { data: publicUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    toast({
      title: "Éxito",
      description: "Audio subido correctamente a Supabase",
    });

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    toast({
      title: "Error",
      description: "Error al subir el archivo a Supabase",
      variant: "destructive",
    });
    return null;
  }
};
