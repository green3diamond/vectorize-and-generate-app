import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// --- The two ElevenLabs helper functions (as written previously) ---
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'


const elevenlabs = new ElevenLabsClient({ 
  apiKey: process.env.ELEVEN_LABS_API_KEY 
});

async function speechToText(audioBuffer: Buffer) {
  try {
    console.log('Audio buffer size:', audioBuffer.length);
    
    // Convert Buffer to Blob for the SDK
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    console.log('Created blob, size:', audioBlob.size);
    
    console.log('Sending to ElevenLabs via SDK...');
    const transcription = await elevenlabs.speechToText.convert({
      file: audioBlob,
      modelId: "scribe_v1",
      tagAudioEvents: true,
      languageCode: "eng", // or null for auto-detect
      diarize: false // Set to true if you need speaker identification
    });
    
    // console.log('Speech to text response:', transcription);
    return transcription.text || transcription; // Depending on response structure
    
  } catch (error) {
    console.error('Speech-to-Text Error:', error);
    throw new Error(`Failed to convert speech to text: ${error.message}`);
  }
}


// Text to speech function using ElevenLabs SDK
async function textToSpeech(text: string) {
  try {
    // console.log('Converting text to speech:', text);
    
    const audioStream = await elevenlabs.textToSpeech.convert( VOICE_ID, {
      text: text,
      modelId: "eleven_multilingual_v2",
      outputFormat: 'mp3_44100_128',
    });

    // Convert the stream to a buffer
    const chunks: Buffer[] = [];
    const reader = audioStream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
    
    const audioBuffer = Buffer.concat(chunks);
    // console.log('Audio generated, buffer size:', audioBuffer.length);
    
    return audioBuffer;
    
  } catch (error) {
    console.error('Text-to-Speech Error:', error);
    throw new Error(`Failed to convert text to speech: ${error.message}`);
  }
}

// --- Next.js API Route Handler ---
export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type')
        let responsePayload: { [key: string]: any } = {}
        
        if (contentType && contentType.includes('application/json')) {
            // Text to Speech: receive { text }
            const { text } = await request.json()
            const audioBuffer = await textToSpeech(text)
            // Return audio as base64 for client playback
            responsePayload.audio = Buffer.from(audioBuffer).toString('base64')
        } else if (contentType && contentType.includes('multipart/form-data')) {
            
          // console.log('Received request:', request.body)
          
          // Speech to Text: receive audio file
          const formData = await request.formData()
          const audioFile = formData.get('audio')
          
          // console.log("Audio file: ", audioFile)
          if(audioFile){
              const arrayBuffer = await audioFile.arrayBuffer()
              // console.log("ArrayBuffer: ", arrayBuffer)
              const buffer = Buffer.from(arrayBuffer)
              const transcript = await speechToText(buffer)
              responsePayload.text = transcript
          } else {
              return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
          }
    } else {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    return NextResponse.json(
      { error: 'Voice conversion failed' },
      { status: 500 }
    )
  }
}
