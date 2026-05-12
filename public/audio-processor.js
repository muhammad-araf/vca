// AudioWorklet processor for capturing PCM audio at 16kHz
// Runs in AudioWorkletGlobalScope — no access to window/btoa/document

// Base64 lookup table (AudioWorklet has no btoa)
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function uint8ArrayToBase64(bytes) {
  let result = "";
  const len = bytes.length;
  let i = 0;

  while (i < len) {
    const a = bytes[i++];
    const b = i < len ? bytes[i++] : 0;
    const c = i < len ? bytes[i++] : 0;

    const triplet = (a << 16) | (b << 8) | c;

    result += BASE64_CHARS[(triplet >> 18) & 0x3f];
    result += BASE64_CHARS[(triplet >> 12) & 0x3f];
    result += i - 2 <= len ? BASE64_CHARS[(triplet >> 6) & 0x3f] : "=";
    result += i - 1 <= len ? BASE64_CHARS[triplet & 0x3f] : "=";
  }

  return result;
}

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._bufferSize = 2048;
    this._buffer = new Float32Array(this._bufferSize);
    this._bytesWritten = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0];

    for (let i = 0; i < channelData.length; i++) {
      this._buffer[this._bytesWritten++] = channelData[i];

      if (this._bytesWritten >= this._bufferSize) {
        // Convert Float32 to Int16 PCM
        const int16Array = new Int16Array(this._bufferSize);
        for (let j = 0; j < this._bufferSize; j++) {
          const s = Math.max(-1, Math.min(1, this._buffer[j]));
          int16Array[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert to base64 using our custom implementation
        const uint8View = new Uint8Array(int16Array.buffer);
        const base64 = uint8ArrayToBase64(uint8View);

        this.port.postMessage({
          type: "audio",
          data: base64,
        });

        this._bytesWritten = 0;
      }
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
