
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
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing audio chunk...');

    // Extract base64 data
    const base64Data = audio.split(',')[1] || audio;

    // Call FAL.AI whisper endpoint
    console.log('Calling FAL.AI whisper endpoint...');
    const response = await fetch('https://rest.fal.ai/fal-ai/whisper', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FAL_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audio // Send the complete data URL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAL.AI API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Error en el servicio de transcripción',
          details: errorText 
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = await response.json();
    console.log('FAL.AI transcription:', result);

    // Send to Make webhook if URL is configured
    const webhookUrl = Deno.env.get('MAKE_WEBHOOK_URL');
    let analysis = null;

    if (webhookUrl && result.text) {
      console.log('Sending to Make webhook...');
      try {
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
      } catch (webhookError) {
        console.error('Make webhook error:', webhookError);
        // Continue execution even if webhook fails
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
        error: 'Error al procesar el audio',
        details: error.message 
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
