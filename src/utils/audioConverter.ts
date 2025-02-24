
export async function convertWebmToMp3(webmBlob: Blob): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      // Crear un AudioContext con manejo correcto de tipos
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Convertir el blob a ArrayBuffer
      const arrayBuffer = await webmBlob.arrayBuffer();
      
      // Decodificar el audio
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Crear un OfflineAudioContext para la conversión
      const offlineAudioContext = new OfflineAudioContext({
        numberOfChannels: audioBuffer.numberOfChannels,
        length: audioBuffer.length,
        sampleRate: audioBuffer.sampleRate
      });
      
      // Crear una fuente de buffer
      const source = offlineAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineAudioContext.destination);
      source.start();
      
      // Renderizar el audio
      const renderedBuffer = await offlineAudioContext.startRendering();
      
      // Convertir el buffer a WAV
      const wavBlob = await convertBufferToWavBlob(renderedBuffer);
      
      resolve(wavBlob);
    } catch (error) {
      console.error('Error al convertir audio:', error);
      reject(error);
    }
  });
}

function convertBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numberOfChannels * 2;
  const sampleRate = buffer.sampleRate;
  
  // Crear el WAV header
  const wavHeader = createWavHeader(length, numberOfChannels, sampleRate);
  
  // Crear el AudioData
  const audioData = new Float32Array(buffer.length * numberOfChannels);
  
  // Mezclar los canales
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < buffer.length; i++) {
      audioData[i * numberOfChannels + channel] = channelData[i];
    }
  }
  
  // Convertir a 16-bit PCM
  const pcmData = new Int16Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    const s = Math.max(-1, Math.min(1, audioData[i]));
    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  // Crear el blob final
  return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
}

function createWavHeader(dataLength: number, numChannels: number, sampleRate: number): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // "RIFF" descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  
  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  
  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  return header;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
