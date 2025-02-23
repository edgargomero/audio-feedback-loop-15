
import { supabase } from "../integrations/supabase/client";
import { toast } from "../hooks/use-toast";

export const uploadToSupabase = async (audioBlob: Blob) => {
  const BUCKET_NAME = "audio_chunks";
  
  try {
    console.log('Iniciando proceso de subida:', {
      bucketName: BUCKET_NAME,
      blobTipo: audioBlob.type,
      blobTamaño: audioBlob.size,
      supabaseURL: supabase.storageUrl,
    });

    // Generar un nombre único para el archivo
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `audio-${timestamp}-${randomString}.webm`;

    console.log('Preparando subida con nombre de archivo:', fileName);

    // Verificar que el bucket existe
    const { data: buckets, error: bucketError } = await supabase.storage
      .listBuckets();
    
    console.log('Buckets disponibles:', buckets);

    if (bucketError) {
      console.error('Error al listar buckets:', bucketError);
      throw bucketError;
    }

    // Subir el archivo a Supabase
    console.log('Iniciando subida del archivo...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, audioBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: audioBlob.type
      });

    if (uploadError) {
      console.error('Error al subir a Supabase:', {
        error: uploadError,
        detalles: uploadError.message,
        código: uploadError.statusCode,
      });
      toast({
        title: "Error",
        description: `Error al subir el archivo: ${uploadError.message}`,
        variant: "destructive",
      });
      return null;
    }

    console.log('Archivo subido exitosamente:', uploadData);

    // Obtener la URL pública
    console.log('Obteniendo URL pública...');
    const { data: publicUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log('URL pública generada:', publicUrlData.publicUrl);
    
    toast({
      title: "Éxito",
      description: "Audio subido correctamente a Supabase",
    });

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error inesperado en el proceso de subida:', error);
    toast({
      title: "Error",
      description: "Error inesperado al subir el archivo",
      variant: "destructive",
    });
    return null;
  }
};

