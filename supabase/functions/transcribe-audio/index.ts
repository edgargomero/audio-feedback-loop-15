
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, content-length',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('Function invoked with method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Log headers for debugging
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { audio } = await req.json();
    
    if (!audio) {
      console.error('No audio data provided');
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing audio chunk...');

    // Convert base64 to audio data
    const base64Data = audio.split(',')[1] || audio;
    
    // Call FAL.AI whisper endpoint
    console.log('Calling FAL.AI whisper endpoint...');
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      console.error('FAL_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Transcription service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch('https://rest.fal.ai/fal-ai/whisper', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${falKey}`,
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
      return new Response(
        JSON.stringify({ 
          error: 'Error en el servicio de transcripción',
          details: errorText 
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await response.json();
    console.log('FAL.AI transcription result:', result);

    // Send to Make webhook
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
    );

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
    );
  }
});
