
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, content-length',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    const { audio } = await req.json()
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    console.log('Processing audio chunk...');

    // Convert base64 to audio data
    const base64Data = audio.split(',')[1] || audio;
    const blobData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const audioBlob = new Blob([blobData], { type: 'audio/webm' });

    // Create FormData and append the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    // Call FAL.AI whisper endpoint
    console.log('Calling FAL.AI whisper endpoint...');
    const response = await fetch('https://rest.fal.ai/fal-ai/whisper', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FAL_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          audio_data: base64Data
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAL.AI API error:', errorText);
      throw new Error(`FAL.AI API error: ${errorText}`);
    }

    const result = await response.json();
    console.log('FAL.AI transcription:', result);

    // Send to Make webhook if URL is configured
    const webhookUrl = Deno.env.get('MAKE_WEBHOOK_URL');
    let analysis = null;

    if (webhookUrl && result.text) {
      console.log('Sending to Make webhook...');
      const makeResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: result.text,
          timestamp: new Date().toISOString(),
        }),
      });

      if (makeResponse.ok) {
        analysis = await makeResponse.json();
        console.log('Make analysis:', analysis);
      } else {
        console.error('Make webhook error:', await makeResponse.text());
      }
    }

    return new Response(
      JSON.stringify({ 
        text: result.text,
        analysis: analysis
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorDetail: error.stack 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )
  }
})
