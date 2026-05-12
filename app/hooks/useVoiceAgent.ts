"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AGENT_CONFIG } from "../config/agent";

export type AgentState =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "ai-speaking"
  | "ended"
  | "error";

export interface TranscriptEntry {
  role: "user" | "ai" | "system";
  text: string;
  timestamp: number;
}

interface UseVoiceAgentReturn {
  state: AgentState;
  isMuted: boolean;
  callDuration: number;
  transcript: TranscriptEntry[];
  audioLevel: number;
  errorMessage: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
}

export function useVoiceAgent(): UseVoiceAgentReturn {
  const [state, setState] = useState<AgentState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<"idle" | "processing" | "confirmed" | "error">("idle");
  const [lastOrder, setLastOrder] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nextPlayTimeRef = useRef(0);
  const isMutedRef = useRef(false);
  const stateRef = useRef<AgentState>("idle");

  // Keep refs in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (
      playbackContextRef.current &&
      playbackContextRef.current.state !== "closed"
    ) {
      playbackContextRef.current.close().catch(() => {});
      playbackContextRef.current = null;
    }
    if (wsRef.current) {
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    nextPlayTimeRef.current = 0;
  }, []);

  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      setAudioLevel(avg / 255);

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, []);

  // Play received PCM audio from Gemini (24kHz Int16)
  const playAudioChunk = useCallback((base64Data: string) => {
    if (
      !playbackContextRef.current ||
      playbackContextRef.current.state === "closed"
    )
      return;

    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert Int16 PCM to Float32
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const ctx = playbackContextRef.current;
      if (ctx.state === "closed") return;

      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime + 0.05, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
    } catch (err) {
      console.error("[Voice] Error playing audio:", err);
    }
  }, []);

  const clearPlayback = useCallback(() => {
    nextPlayTimeRef.current = 0;
    if (
      playbackContextRef.current &&
      playbackContextRef.current.state !== "closed"
    ) {
      const oldCtx = playbackContextRef.current;
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      oldCtx.close().catch(() => {});
    }
  }, []);

  const startCall = useCallback(async () => {
    try {
      setState("connecting");
      setErrorMessage(null);
      setTranscript([]);
      setCallDuration(0);

      // 1. Fetch the Gemini WebSocket URL from our server
      const sessionRes = await fetch("/api/session");
      if (!sessionRes.ok) {
        throw new Error("Failed to get session. Check your API key.");
      }
      const { wsUrl } = await sessionRes.json();

      // 2. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 3. Set up capture AudioContext at 16kHz
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Load AudioWorklet processor
      await audioContext.audioWorklet.addModule("/audio-processor.js");
      const workletNode = new AudioWorkletNode(
        audioContext,
        "audio-processor"
      );
      workletNodeRef.current = workletNode;
      source.connect(workletNode);

      // 4. Set up playback context at 24kHz
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });

      // 5. Connect directly to Gemini Live API
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Voice] Connected to Gemini Live API");

        // Send setup message (first message for raw WebSocket API)
        const setupMessage = {
          setup: {
            model: `models/${AGENT_CONFIG.model}`,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: AGENT_CONFIG.voice,
                  },
                },
              },
            },
            systemInstruction: {
              parts: [
                {
                  text: AGENT_CONFIG.systemPrompt,
                },
              ],
            },
            tools: [
              {
                functionDeclarations: [
                  {
                    name: "place_order",
                    description: "Submit a restaurant order to the database.",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        items: {
                          type: "ARRAY",
                          items: {
                            type: "OBJECT",
                            properties: {
                              name: { type: "STRING" },
                              qty: { type: "NUMBER" },
                              price: { type: "NUMBER" },
                            },
                          },
                        },
                        total: { type: "NUMBER" },
                        customer_name: { type: "STRING" },
                        phone: { type: "STRING" },
                        address: { type: "STRING" },
                        order_type: { type: "STRING" },
                      },
                      required: ["items", "total"],
                    },
                  },
                ],
              },
            ],
          },
        };

        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        try {
          let data = event.data;
          if (data instanceof Blob) {
            data = await data.text();
          }
          const response = JSON.parse(data);

          // Handle setup complete
          if (response.setupComplete) {
            setState("listening");
            // Start timer
            timerRef.current = setInterval(() => {
              setCallDuration((d) => d + 1);
            }, 1000);
            monitorAudioLevel();
            setTranscript((prev) => [
              ...prev,
              {
                role: "system",
                text: "Call connected",
                timestamp: Date.now(),
              },
            ]);

            // Trigger AI to speak first
            const initMessage = {
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [{ text: "Hello, please greet the customer as instructed in your system prompt. Start the conversation." }],
                  },
                ],
                turnComplete: true,
              },
            };
            ws.send(JSON.stringify(initMessage));

            return;
          }

          // Handle server content (audio + text)
          if (response.serverContent) {
            const sc = response.serverContent;

            if (sc.modelTurn) {
              const parts = sc.modelTurn.parts || [];
              for (const part of parts) {
                if (part.inlineData) {
                  setState("ai-speaking");
                  playAudioChunk(part.inlineData.data);
                }
                if (part.text) {
                  setTranscript((prev) => [
                    ...prev,
                    {
                      role: "ai",
                      text: part.text,
                      timestamp: Date.now(),
                    },
                  ]);
                }
              }
            }

            // Live transcription from Gemini
            if (sc.inputTranscription) {
              setTranscript((prev) => [
                ...prev,
                {
                  role: "user",
                  text: sc.inputTranscription.text,
                  timestamp: Date.now(),
                },
              ]);
            }
            if (sc.outputTranscription) {
              setTranscript((prev) => [
                ...prev,
                {
                  role: "ai",
                  text: sc.outputTranscription.text,
                  timestamp: Date.now(),
                },
              ]);
            }

            if (sc.turnComplete) {
              setState("listening");
            }

            if (sc.interrupted) {
              clearPlayback();
              setState("listening");
            }
          }

          // Handle tool calls
          if (response.toolCall) {
            const toolCall = response.toolCall;
            for (const fc of toolCall.functionCalls) {
              if (fc.name === "place_order") {
                console.log("[Voice] Placing order:", fc.args);
                setOrderStatus("processing");
                setLastOrder(fc.args);
                
                // Call our internal API to save to Supabase
                fetch("/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...fc.args,
                    transcript: transcript.map(t => `${t.role}: ${t.text}`).join("\n")
                  }),
                }).then(res => res.json())
                  .then(data => {
                    if (data.success) {
                      setOrderStatus("confirmed");
                    } else {
                      setOrderStatus("error");
                    }
                    // Send response back to Gemini
                    wsRef.current?.send(JSON.stringify({
                      toolResponse: {
                        functionResponses: [{
                          name: "place_order",
                          id: fc.id,
                          response: { result: "Order placed successfully! ID: " + data.id }
                        }]
                      }
                    }));
                  }).catch(err => {
                    console.error("[Voice] Order failed:", err);
                    setOrderStatus("error");
                    wsRef.current?.send(JSON.stringify({
                      toolResponse: {
                        functionResponses: [{
                          name: "place_order",
                          id: fc.id,
                          response: { error: "Failed to save order to database." }
                        }]
                      }
                    }));
                  });
              }
            }
          }
        } catch (err) {
          console.error("[Voice] Error parsing Gemini message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[Voice] WebSocket error:", err);
        setErrorMessage("Connection error. Please check your API key and try again.");
        setState("error");
        cleanup();
      };

      ws.onclose = (event) => {
        console.log(`[Voice] WebSocket closed: ${event.code} ${event.reason}`);
        if (
          stateRef.current !== "ended" &&
          stateRef.current !== "error" &&
          stateRef.current !== "idle"
        ) {
          setState("ended");
          cleanup();
        }
      };

      // 6. Forward microphone audio to Gemini
      workletNode.port.onmessage = (event) => {
        if (
          event.data.type === "audio" &&
          wsRef.current &&
          wsRef.current.readyState === WebSocket.OPEN &&
          !isMutedRef.current
        ) {
          const realtimeInput = {
            realtimeInput: {
              audio: {
                data: event.data.data,
                mimeType: "audio/pcm;rate=16000",
              },
            },
          };
          wsRef.current.send(JSON.stringify(realtimeInput));
        }
      };
    } catch (err: any) {
      console.error("[Voice] Error starting call:", err);
      if (err.name === "NotAllowedError") {
        setErrorMessage(
          "Microphone access denied. Please allow microphone access and try again."
        );
      } else if (err.name === "NotFoundError") {
        setErrorMessage("No microphone found. Please connect a microphone.");
      } else {
        setErrorMessage(err.message || "Failed to start call.");
      }
      setState("error");
      cleanup();
    }
  }, [cleanup, monitorAudioLevel, playAudioChunk, clearPlayback]);

  const endCall = useCallback(() => {
    setState("ended");
    cleanup();
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  }, []);

  return {
    state,
    isMuted,
    callDuration,
    transcript,
    audioLevel,
    errorMessage,
    orderStatus,
    lastOrder,
    startCall,
    endCall,
    toggleMute,
  };
}
