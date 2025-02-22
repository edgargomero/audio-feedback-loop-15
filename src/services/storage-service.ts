
import { createClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL, 
  SUPABASE_SERVICE_KEY, 
  BUCKET_NAME, 
  MAKE_WEBHOOK_URL 
} from '../types/feedback';

// Crear cliente de Supabase usando la clave de servicio
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const uploadToSupabase = async (audioBlob: Blob) => {
  try {
    console.log('Iniciando subida a Supabase...');
    
    const fileName = `audio_${Date.now()}.webm`;
    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    
    // Subir usando fetch directamente con FormData
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error detallado de subida:', error);
      throw new Error(`Error al subir: ${response.status}`);
    }

    // Construir URL pública
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
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
