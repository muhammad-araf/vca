"use client";

import { useEffect, useRef, useState } from "react";

export function useVoiceChat(widgetKey: string | null) {
  const [inCall, setInCall] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [transcript, setTranscript] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [rmsValue, setRmsValue] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const setupCompleteRef = useRef(false);

  const cleanup = () => {
    setInCall(false);
    setStatus("Idle");
    setupCompleteRef.current = false;
    nextPlayTimeRef.current = 0;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (playbackCtxRef.current) {
      playbackCtxRef.current.close();
      playbackCtxRef.current = null;
    }
  };

  const startCall = async () => {
    if (!widgetKey) return;
    cleanup();

    try {
      setStatus("Connecting...");
      setInCall(true);

      const res = await fetch(`/api/session?widgetKey=${widgetKey}`);
      if (!res.ok) throw new Error("Failed to get session");
      const data = await res.json();

      const ws = new WebSocket(data.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          setup: {
            model: "models/gemini-3.1-flash-live-preview",
            generationConfig: { responseModalities: ["AUDIO"] },
            systemInstruction: { parts: [{ text: data.systemInstruction }] }
          }
        }));
      };

      ws.onmessage = async (event) => {
        let raw = event.data;
        if (raw instanceof Blob) raw = await raw.text();
        const msg = JSON.parse(raw);

        if (msg.setupComplete) {
          setupCompleteRef.current = true;
          setStatus("Connected");
          await startMicrophone();
          // Greeting
          ws.send(JSON.stringify({
            clientContent: {
              turns: [{ role: "user", parts: [{ text: "Hello! Please greet me." }] }],
              turnComplete: true
            }
          }));
        } else if (msg.serverContent?.modelTurn) {
          const parts = msg.serverContent.modelTurn.parts || [];
          if (parts.length > 0) setIsAISpeaking(true);
          for (const part of parts) {
            if (part.inlineData?.data) queueAudio(part.inlineData.data);
            if (part.text) {
               setTranscript(prev => [...prev, { role: "agent", text: part.text }]);
            }
          }
        } else if (msg.serverContent?.turnComplete) {
          setIsAISpeaking(false);
        }
      };

      ws.onclose = () => cleanup();
      ws.onerror = () => {
        setStatus("Error");
        cleanup();
      };

    } catch (err) {
      console.error(err);
      setStatus("Failed");
      setInCall(false);
    }
  };

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
      });
      micStreamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      await audioCtx.audioWorklet.addModule("/audio-processor.js");
      const source = audioCtx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioCtx, "audio-processor");
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (e) => {
        if (e.data.rms !== undefined) setRmsValue(e.data.rms);
        if (wsRef.current?.readyState === WebSocket.OPEN && setupCompleteRef.current && e.data.data) {
          wsRef.current.send(JSON.stringify({
            realtimeInput: {
              audio: { mimeType: "audio/pcm;rate=16000", data: e.data.data }
            }
          }));
        }
      };

      source.connect(workletNode);
    } catch (err) {
      console.error(err);
    }
  };

  const queueAudio = (base64pcm: string) => {
    if (!playbackCtxRef.current || playbackCtxRef.current.state === "closed") {
      playbackCtxRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = 0;
    }
    const ctx = playbackCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const binaryString = atob(base64pcm);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768.0;

    const buffer = ctx.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
  };

  const sendText = (text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && setupCompleteRef.current) {
      setTranscript(prev => [...prev, { role: "user", text }]);
      wsRef.current.send(JSON.stringify({
        clientContent: {
          turns: [{ role: "user", parts: [{ text }] }],
          turnComplete: true
        }
      }));
    }
  };

  return { inCall, status, transcript, startCall, endCall: cleanup, isAISpeaking, rmsValue, sendText };
}
