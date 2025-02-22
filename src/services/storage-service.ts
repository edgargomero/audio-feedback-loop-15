
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET_NAME, MAKE_WEBHOOK_URL } from '../types/feedback';

// Crear cliente de Supabase con configuración mínima
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const uploadToSupabase = async (audioBlob: Blob) => {
  try {
    console.log('Iniciando subida a Supabase...');
    console.log('URL:', SUPABASE_URL);
    
    const fileName = `audio_${Date.now()}.webm`;
    
    // Intentar subida directa sin verificar buckets
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, audioBlob, {
        contentType: 'audio/webm'
      });

    if (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }

    // Obtener URL pública
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
