
import { supabase } from "../integrations/supabase/client";
import { toast } from "../hooks/use-toast";

export const uploadToSupabase = async (audioBlob: Blob) => {
  const BUCKET_NAME = "audio_chunks";
  
  try {
    // Generar un nombre único para el archivo
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `audio-${timestamp}-${randomString}.webm`;

    console.log('Iniciando subida a Supabase:', {
      bucketName: BUCKET_NAME,
      fileName: fileName,
      blobSize: audioBlob.size
    });

    // Subir el archivo a Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, audioBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error al subir a Supabase:', error);
      toast({
        title: "Error",
        description: "Error al subir el archivo a Supabase",
        variant: "destructive",
      });
      return null;
    }

    // Obtener la URL pública
    const { data: publicUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log('Archivo subido exitosamente:', publicUrlData.publicUrl);
    
    toast({
      title: "Éxito",
      description: "Audio subido correctamente a Supabase",
    });

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({
      title: "Error",
      description: "Error inesperado al subir el archivo",
      variant: "destructive",
    });
    return null;
  }
};
