
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

    // Process base64 audio
    const base64Data = audio.split(',')[1] || audio;
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    console.log('Sending to Whisper API...');
    
    // Prepare form data for Whisper
    const formData = new FormData()
    const blob = new Blob([bytes], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    // Send to OpenAI Whisper
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', errorText);
      throw new Error(`Whisper API error: ${errorText}`);
    }

    const result = await response.json()
    console.log('Whisper transcription:', result.text);

    // Send to Make webhook if URL is configured
    const webhookUrl = Deno.env.get('MAKE_WEBHOOK_URL');
    let analysis = null;

    if (webhookUrl) {
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
