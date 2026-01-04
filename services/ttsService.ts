
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let audioContext: AudioContext | null = null;
let currentSources: AudioBufferSourceNode[] = [];
let abortController: AbortController | null = null;
let activeMessageId: string | null = null;

const decodeBase64ToAudioBuffer = async (ctx: AudioContext, base64: string): Promise<AudioBuffer> => {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};

export const stopGuruSpeaking = () => {
  activeMessageId = null;
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  
  // Kill all hardware sources
  currentSources.forEach(source => {
    try {
      source.onended = null;
      source.stop(0);
      source.disconnect();
    } catch (e) {}
  });
  currentSources = [];

  // Hard reset the audio context to flush all remaining audio in the system buffer
  if (audioContext) {
    const ctx = audioContext;
    audioContext = null;
    ctx.close().catch(() => {});
  }
};

const cleanForSpeech = (text: string) => {
  return text
    .replace(/\[3D:.*?\]/g, '')
    .replace(/\[DRAW:.*?\]/g, '')
    .replace(/\[NOTE:.*?\|(.*?)\]/g, '$1')
    .replace(/\[END_NOTE\]/g, '')
    .replace(/\[DIFF:.*?\|.*?\]/g, '')
    .replace(/\[END_DIFF\]/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/_{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Aggressive Macro-chunking:
 * We now group MUCH larger blocks (800+ chars) to ensure the AI handles 
 * pauses at periods and commas naturally. Gaps only occur between these 
 * large blocks, which are pre-fetched.
 */
const getSpeechBlocks = (text: string) => {
  const cleaned = cleanForSpeech(text);
  // Split primarily by double newlines or large paragraph breaks
  const paragraphs = cleaned.split(/\n\s*\n/);
  
  const blocks: string[] = [];
  let currentBlock = "";

  for (const p of paragraphs) {
    if ((currentBlock + p).length < 800) {
      currentBlock += (currentBlock ? "\n" : "") + p;
    } else {
      if (currentBlock) blocks.push(currentBlock.trim());
      currentBlock = p;
    }
  }
  if (currentBlock) blocks.push(currentBlock.trim());

  return blocks.filter(b => b.length > 2);
};

const fetchAudioChunk = async (chunk: string, signal: AbortSignal): Promise<AudioBuffer | null> => {
  if (signal.aborted) return null;

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: chunk }] }],
      config: {
        responseModalities: ["AUDIO"] as any,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
      },
    });

    if (signal.aborted) return null;

    const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    if (base64Audio) {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      return await decodeBase64ToAudioBuffer(audioContext, base64Audio);
    }
  } catch (err) {
    if (err.name !== 'AbortError') console.error("TTS Fetch Error:", err);
  }
  return null;
};

export const speakText = async (messageId: string, text: string, speed: number, onEnd: () => void): Promise<void> => {
  stopGuruSpeaking(); 
  activeMessageId = messageId;
  abortController = new AbortController();
  const signal = abortController.signal;

  const blocks = getSpeechBlocks(text);
  if (blocks.length === 0) {
    onEnd();
    return;
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (audioContext.state === 'suspended') await audioContext.resume();

  let nextStartTime = audioContext.currentTime + 0.1;
  let playedCount = 0;

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContext || signal.aborted || activeMessageId !== messageId) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = speed;
    source.connect(audioContext.destination);

    const startTime = Math.max(nextStartTime, audioContext.currentTime);
    source.start(startTime);
    nextStartTime = startTime + (buffer.duration / speed);
    
    currentSources.push(source);
    source.onended = () => {
      currentSources = currentSources.filter(s => s !== source);
      playedCount++;
      if (playedCount === blocks.length && activeMessageId === messageId) {
        onEnd();
      }
    };
  };

  try {
    // Parallel Fetch with Sequential Playback
    // This starts playing the first block as soon as it's ready, 
    // and keeps the next blocks queued up perfectly.
    const fetchAndQueue = async (index: number) => {
      if (index >= blocks.length || signal.aborted || activeMessageId !== messageId) return;
      
      const buffer = await fetchAudioChunk(blocks[index], signal);
      if (buffer && !signal.aborted) {
        playBuffer(buffer);
        // Start fetching next one even before current finishes playing
        fetchAndQueue(index + 1);
      } else if (!signal.aborted) {
        playedCount++;
        fetchAndQueue(index + 1);
      }
    };

    fetchAndQueue(0);

  } catch (err) {
    if (err.name !== 'AbortError') onEnd();
  }
};

export const preCacheFirstChunk = (messageId: string, text: string) => {
  // Logic handled internally by speakText's new parallel queuing
};
