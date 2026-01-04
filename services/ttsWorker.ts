
/**
 * MP Board Guru Audio Worker
 * Handles base64 decoding and PCM Int16 to Float32 conversion.
 */
self.onmessage = (e) => {
  const { base64Data, sampleRate, numChannels } = e.data;
  
  try {
    // 1. Base64 to Bytes
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. PCM to Float32
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length / numChannels;
    const channelData = new Float32Array(frameCount);

    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels] / 32768.0;
    }

    // 3. Send back processed samples
    self.postMessage({ samples: channelData, frameCount, sampleRate, numChannels });
  } catch (err) {
    self.postMessage({ error: err.message });
  }
};
