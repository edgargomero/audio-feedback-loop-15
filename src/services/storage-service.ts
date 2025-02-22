
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET_NAME, MAKE_WEBHOOK_URL } from '../types/feedback';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const uploadToSupabase = async (audioBlob: Blob) => {
  try {
    const fileName = `audio_${Date.now()}.webm`;
    
    // Verificar si el bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('Buckets disponibles:', buckets);

    // Asegurarnos que el bucket existe
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket(BUCKET_NAME, {
        public: false,
        allowedMimeTypes: ['audio/webm'],
        fileSizeLimit: 5242880, // 5MB
      });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.error('Error al crear/verificar bucket:', bucketError);
      throw bucketError;
    }

    // Intentar la subida del archivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, audioBlob, {
        cacheControl: '3600',
        contentType: 'audio/webm',
        upsert: false
      });

    if (error) {
      console.error('Error de Supabase:', error);
      throw error;
    }

    // Obtener la URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log('Audio guardado en:', publicUrl);

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
    console.error('Error al procesar audio:', error);
    throw error;
  }
};
