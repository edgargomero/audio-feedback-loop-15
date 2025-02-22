
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET_NAME, MAKE_WEBHOOK_URL } from '../types/feedback';

// Crear el cliente con opciones adicionales
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false // Desactivar persistencia de sesión
  }
});

export const uploadToSupabase = async (audioBlob: Blob) => {
  try {
    console.log('Iniciando subida a Supabase...');
    console.log('URL:', SUPABASE_URL);
    console.log('Bucket:', BUCKET_NAME);
    
    const fileName = `audio_${Date.now()}.webm`;
    
    // Verificar si podemos acceder al bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error al listar buckets:', bucketsError);
      throw bucketsError;
    }
    
    console.log('Buckets disponibles:', buckets);

    // Intentar la subida del archivo
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, audioBlob, {
        cacheControl: '3600',
        contentType: 'audio/webm',
        upsert: true
      });

    if (uploadError) {
      console.error('Error al subir archivo:', uploadError);
      throw uploadError;
    }

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log('Audio guardado exitosamente en:', publicUrl);

    // Enviar a Make
    const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioUrl: publicUrl,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!makeResponse.ok) {
      throw new Error('Error al enviar a Make');
    }

    const analysisData = await makeResponse.json();
    return analysisData;

  } catch (error) {
    console.error('Error detallado al procesar audio:', error);
    throw error;
  }
};
