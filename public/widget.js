// Vocalink Embeddable Widget Script
// Usage: <script src="http://localhost:3000/widget.js" data-agent-id="AGENT_KEY"></script>

(function () {
  'use strict';

  const script = document.currentScript || document.querySelector('script[data-agent]') || document.querySelector('script[data-agent-id]');
  const agentKey = script?.getAttribute('data-agent') || script?.getAttribute('data-agent-id');
  if (!agentKey) { console.warn('[Vocalink] No data-agent key found.'); return; }

  // BASE = the origin where widget.js is served from (i.e. your Next.js server)
  const BASE = new URL(script.src).origin;

  function initVocalink() {
    if (!document.body) {
      window.addEventListener('DOMContentLoaded', initVocalink);
      return;
    }

    // ── Inject Styles ──
    const style = document.createElement('style');
    style.textContent = `
      #vocalink-widget-btn {
        position: fixed; bottom: 24px; right: 24px; z-index: 99999;
        width: 60px; height: 60px; border-radius: 50%;
        background: #000; border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
      }
      #vocalink-widget-btn:hover { transform: scale(1.08); box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
      #vocalink-widget-btn svg { width: 24px; height: 24px; stroke: white; fill: none; }
      #vocalink-widget-btn.active { background: #111; }
      #vocalink-widget-btn .pulse-ring {
        position: absolute; inset: -6px; border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.2);
        animation: vl-pulse 1.5s infinite;
      }
      @keyframes vl-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.4); opacity: 0; }
      }
      #vocalink-widget-panel {
        position: fixed; bottom: 96px; right: 24px; z-index: 99998;
        width: 300px; background: #0a0a0a;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      }
      #vocalink-widget-panel.hidden { opacity: 0; transform: translateY(12px) scale(0.95); pointer-events: none; }
      .vl-header { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 10px; }
      .vl-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; }
      .vl-name { color: white; font-size: 13px; font-weight: 600; }
      .vl-status { color: rgba(255,255,255,0.4); font-size: 11px; }
      .vl-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; margin-right: 4px; animation: vl-blink 1.5s infinite; }
      @keyframes vl-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      .vl-body { padding: 20px; text-align: center; }
      .vl-wave { display: flex; align-items: flex-end; justify-content: center; gap: 3px; height: 40px; margin-bottom: 12px; }
      .vl-bar { width: 3px; border-radius: 2px; background: white; transition: height 0.15s ease; }
      .vl-label { color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 16px; }
      .vl-debug { color: rgba(255,255,255,0.25); font-size: 10px; margin-top: 8px; min-height: 14px; }
      .vl-btn { width: 100%; padding: 12px; border-radius: 12px; background: white; border: none; color: black; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
      .vl-btn:hover { background: #e5e5e5; }
      .vl-btn.end { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
      .vl-footer { padding: 10px; text-align: center; border-top: 1px solid rgba(255,255,255,0.04); }
      .vl-footer a { color: rgba(255,255,255,0.2); font-size: 10px; text-decoration: none; }
    `;
    document.head.appendChild(style);

    // ── Floating Button ──
    const btn = document.createElement('div');
    btn.id = 'vocalink-widget-btn';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
        <path d="M19 10v2a7 7 0 01-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    `;
    document.body.appendChild(btn);

    // ── Panel ──
    const panel = document.createElement('div');
    panel.id = 'vocalink-widget-panel';
    panel.className = 'hidden';
    panel.innerHTML = `
      <div class="vl-header">
        <div class="vl-avatar">V</div>
        <div>
          <div class="vl-name">Voice Assistant</div>
          <div class="vl-status"><span class="vl-dot"></span>Online</div>
        </div>
      </div>
      <div class="vl-body">
        <div class="vl-wave" id="vl-wave">
          ${Array.from({length: 12}).map((_,i) => `<div class="vl-bar" style="height:${8+i%5*6}px;opacity:${0.3+i*0.05}"></div>`).join('')}
        </div>
        <div class="vl-label" id="vl-status-label">Tap to start a conversation</div>
        <button class="vl-btn" id="vl-main-btn">🎤 Start Voice Chat</button>
        <div class="vl-debug" id="vl-debug"></div>
      </div>
      <div class="vl-footer"><a href="https://vocalink.ai" target="_blank">Powered by Vocalink</a></div>
    `;
    document.body.appendChild(panel);

    // ── Toggle Panel ──
    let panelVisible = false;
    btn.addEventListener('click', () => {
      panelVisible = !panelVisible;
      panel.classList.toggle('hidden', !panelVisible);
      btn.classList.toggle('active', panelVisible);
    });

    // ── Voice State ──
    const mainBtn = document.getElementById('vl-main-btn');
    const statusLabel = document.getElementById('vl-status-label');
    const debugEl = document.getElementById('vl-debug');
    let inCall = false;
    let ws = null;
    let audioCtx = null;
    let microphoneStream = null;
    let audioWorkletNode = null;
    let isSetupComplete = false;
    let ambienceAudio = null;
    let isAISpeaking = false;


    function log(msg) {
      console.log('[Vocalink]', msg);
      if (debugEl) debugEl.textContent = msg;
    }

    // ── Start / Stop Call ──
    mainBtn.addEventListener('click', async () => {
      if (inCall) {
        cleanupCall();
        return;
      }

      try {
        statusLabel.textContent = 'Connecting...';
        log('Fetching session...');

        // 1. Get API key + system prompt from our backend using the agentKey
        const res = await fetch(`${BASE}/api/session?widgetKey=${agentKey}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server error ${res.status}`);
        }
        const data = await res.json();
        log('Session received.');

        // Update UI with Dynamic Agent Name
        if (data.agentName) {
          const nameEl = document.querySelector('.vl-name');
          if (nameEl) nameEl.textContent = data.agentName;
        }

        // 2. Connect to Gemini Live API
        ws = new WebSocket(data.wsUrl);

        ws.onopen = () => {
          log('WebSocket open. Sending setup...');
          ws.send(JSON.stringify({
            setup: {
              model: "models/gemini-3.1-flash-live-preview",
              generationConfig: { responseModalities: ["AUDIO"] },
              systemInstruction: {
                parts: [{ text: data.systemInstruction || "You are a helpful voice assistant." }]
              }
            }
          }));
        };

        ws.onmessage = async (event) => {
          try {
            // Handle Blob data (some browsers send Blob instead of string)
            let raw = event.data;
            if (raw instanceof Blob) raw = await raw.text();
            const msg = JSON.parse(raw);

            if (msg.setupComplete) {
              log('AI Ready!');
              isSetupComplete = true;
              statusLabel.textContent = 'AI Ready · Speak now';

              // Start microphone AFTER setup is confirmed
              await startMicrophone();

              // Send initial greeting request
              ws.send(JSON.stringify({
                clientContent: {
                  turns: [{ role: "user", parts: [{ text: "Hello! Please greet me." }] }],
                  turnComplete: true
                }
              }));

            } else if (msg.serverContent && msg.serverContent.modelTurn) {
              const parts = msg.serverContent.modelTurn.parts || [];
              if (parts.length > 0) setAISpeaking(true);
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  queueAudio(part.inlineData.data);
                }
              }
            } else if (msg.serverContent && msg.serverContent.turnComplete) {
              log('AI finished speaking.');
              setAISpeaking(false);
            } else if (msg.error) {
              log('API Error: ' + (msg.error.message || JSON.stringify(msg.error)));
              cleanupCall();
            }
          } catch (err) {
            log('Parse error: ' + err.message);
          }
        };

        ws.onerror = () => { log('WebSocket error.'); };
        ws.onclose = (ev) => {
          log('WS closed: ' + ev.code + ' ' + (ev.reason || ''));
          cleanupCall();
        };

        // Mark as in-call (UI update)
        inCall = true;
        mainBtn.textContent = '⏹ End Call';
        mainBtn.className = 'vl-btn end';
        statusLabel.textContent = 'Connecting to AI...';

        startAmbience();

      } catch (err) {
        log('Error: ' + err.message);
        statusLabel.textContent = 'Connection failed.';
        setTimeout(() => {
          if (!inCall) statusLabel.textContent = 'Tap to start a conversation';
        }, 3000);
      }
    });

    // ── Microphone Setup ──
    async function startMicrophone() {
      try {
        microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
        });
        log('Mic active.');

        audioCtx = new AudioContext({ sampleRate: 16000 });
        if (audioCtx.state === 'suspended') await audioCtx.resume();

        await audioCtx.audioWorklet.addModule(BASE + '/audio-processor.js');
        const source = audioCtx.createMediaStreamSource(microphoneStream);
        audioWorkletNode = new AudioWorkletNode(audioCtx, 'audio-processor');

        audioWorkletNode.port.onmessage = (e) => {
          // Update waveform bars with real mic volume
          if (e.data.rms !== undefined) {
            const bars = document.querySelectorAll('.vl-bar');
            bars.forEach((bar) => {
              const h = 8 + (e.data.rms * 300);
              bar.style.height = `${Math.min(h, 40)}px`;
            });
          }

          // Stream audio to Gemini
          if (ws && ws.readyState === WebSocket.OPEN && isSetupComplete && e.data.data) {
            ws.send(JSON.stringify({
              realtimeInput: {
                audio: {
                  mimeType: "audio/pcm;rate=16000",
                  data: e.data.data
                }
              }
            }));
          }
        };

        source.connect(audioWorkletNode);
        // Don't connect to destination — we don't want mic feedback
        statusLabel.textContent = 'Connected · Speaking...';
      } catch (err) {
        log('Mic error: ' + err.message);
        throw err;
      }
    }

    // ── Audio Playback — single AudioContext, gapless scheduling ──
    let playbackCtx = null;
    let nextPlayTime = 0;

    function queueAudio(base64pcm) {
      try {
        if (!playbackCtx || playbackCtx.state === 'closed') {
          playbackCtx = new AudioContext({ sampleRate: 24000 });
          nextPlayTime = 0;
        }

        if (playbackCtx.state === 'suspended') playbackCtx.resume();

        const binaryString = atob(base64pcm);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }

        const buffer = playbackCtx.createBuffer(1, float32Array.length, 24000);
        buffer.getChannelData(0).set(float32Array);

        const source = playbackCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(playbackCtx.destination);

        // Schedule gaplessly: each chunk starts right after the previous one ends
        const now = playbackCtx.currentTime;
        const startAt = Math.max(now, nextPlayTime);
        source.start(startAt);
        nextPlayTime = startAt + buffer.duration;
      } catch (e) {
        console.error('[Vocalink] Playback error:', e);
      }
    }

    // ── Cleanup ──
    function cleanupCall() {
      inCall = false;
      isSetupComplete = false;
      nextPlayTime = 0;
      if (ws) { try { ws.close(); } catch(e){} ws = null; }
      if (microphoneStream) { microphoneStream.getTracks().forEach(t => t.stop()); microphoneStream = null; }
      if (audioWorkletNode) { try { audioWorkletNode.disconnect(); } catch(e){} audioWorkletNode = null; }
      if (audioCtx) { try { audioCtx.close(); } catch(e){} audioCtx = null; }
      if (playbackCtx) { try { playbackCtx.close(); } catch(e){} playbackCtx = null; }

      mainBtn.textContent = '🎤 Start Voice Chat';
      mainBtn.className = 'vl-btn';
      statusLabel.textContent = 'Tap to start a conversation';
      stopAmbience();
      resetWave();
    }

    // ── Ambience Logic ──
    function startAmbience() {
      if (!ambienceAudio) {
        ambienceAudio = new Audio(`${BASE}/audio/restaurant.mp3`);
        ambienceAudio.loop = true;
        ambienceAudio.volume = 0.28;
      }
      ambienceAudio.play().catch(e => console.warn('[Vocalink] Ambience blocked', e));
    }

    function stopAmbience() {
      if (ambienceAudio) {
        ambienceAudio.pause();
        ambienceAudio.currentTime = 0;
      }
    }

    function setAISpeaking(speaking) {
      isAISpeaking = speaking;
      if (!ambienceAudio) return;

      const targetVol = speaking ? 0.06 : 0.28;
      const step = 0.02;
      const fade = setInterval(() => {
        if (Math.abs(ambienceAudio.volume - targetVol) < step) {
          ambienceAudio.volume = targetVol;
          clearInterval(fade);
        } else {
          ambienceAudio.volume += (targetVol > ambienceAudio.volume ? step : -step);
        }
      }, 30);
    }

    function resetWave() {
      const bars = document.querySelectorAll('.vl-bar');
      bars.forEach((bar, i) => {
        bar.style.height = `${8 + i % 5 * 6}px`;
      });
    }
  }

  // ── Bootstrap ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVocalink);
  } else {
    initVocalink();
  }
})();
