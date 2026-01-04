
import { GoogleGenAI, LiveServerMessage } from '@google/genai';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

function decode(base64: string) {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export interface LiveSessionCallbacks {
  onInputTranscription: (text: string) => void;
  onOutputTranscription: (text: string) => void;
  onTurnComplete: () => void;
  onError: (error: string) => void;
  onClose: () => void;
}

let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();
let stream: MediaStream | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;

export const startLiveSession = async (callbacks: LiveSessionCallbacks, systemInstruction: string) => {
  const ai = getAI();
  
  inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    callbacks.onError("Microphone access denied.");
    return;
  }

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        if (!inputAudioContext || !stream) return;
        const source = inputAudioContext.createMediaStreamSource(stream);
        scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
          callbacks.onInputTranscription(message.serverContent.inputTranscription.text);
        }
        
        if (message.serverContent?.outputTranscription) {
          callbacks.onOutputTranscription(message.serverContent.outputTranscription.text);
        }

        if (message.serverContent?.turnComplete) {
          callbacks.onTurnComplete();
        }

        const base64Audio = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
        if (base64Audio && outputAudioContext) {
          nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
          const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputAudioContext.destination);
          source.addEventListener('ended', () => {
            sources.delete(source);
          });
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
          sources.add(source);
        }

        if (message.serverContent?.interrupted) {
          for (const source of sources.values()) {
            source.stop();
            sources.delete(source);
          }
          nextStartTime = 0;
        }
      },
      onerror: (e) => {
        callbacks.onError("Session Error occurred.");
      },
      onclose: () => {
        callbacks.onClose();
      },
    },
    config: {
      responseModalities: ["AUDIO"] as any,
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: systemInstruction,
    },
  });

  return sessionPromise;
};

export const stopLiveSession = async (sessionPromise: Promise<any>) => {
  const session = await sessionPromise;
  session.close();
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  if (scriptProcessor) {
    scriptProcessor.disconnect();
    scriptProcessor = null;
  }

  if (inputAudioContext) inputAudioContext.close();
  if (outputAudioContext) outputAudioContext.close();
  
  for (const source of sources.values()) {
    try {
      source.stop();
    } catch(e) {}
    sources.delete(source);
  }
};
