"use client";

import { useRef, useEffect } from "react";
import { useVoiceAgent } from "./hooks/useVoiceAgent";
import { AGENT_CONFIG } from "./config/agent";
import Ambience from "./components/Ambience";

// ─── Icons (inline SVG) ───
function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function PhoneOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
      <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.12 1.49-.34 2.18" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function BotIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
    </svg>
  );
}

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  );
}

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function VideoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function ContactsIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ─── Helpers ───
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function SpeakerIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  );
}

function KeypadIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="4" height="4" />
      <rect x="10" y="4" width="4" height="4" />
      <rect x="16" y="4" width="4" height="4" />
      <rect x="4" y="10" width="4" height="4" />
      <rect x="10" y="10" width="4" height="4" />
      <rect x="16" y="10" width="4" height="4" />
      <rect x="4" y="16" width="4" height="4" />
      <rect x="10" y="16" width="4" height="4" />
      <rect x="16" y="16" width="4" height="4" />
    </svg>
  );
}

// ─── Main Component ───
export default function Home() {
  const {
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
  } = useVoiceAgent();

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const isActive = ["listening", "ai-speaking", "connected"].includes(state);

  return (
    <>
      {/* Animated background */}
      <div className="bg-animated" />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          gap: "24px",
        }}
      >
        {/* Background Ambience (Subtle Restaurant Sounds) */}
        <Ambience 
          isActive={isActive || state === "connecting"} 
          isAISpeaking={state === "ai-speaking"} 
        />
        {/* ─── IDLE STATE ─── */}
        {state === "idle" && (
          <div className="fade-in" style={{ textAlign: "center", maxWidth: 400 }}>
            {/* Avatar */}
            <div className="avatar-container" style={{ marginBottom: 32 }}>
              <div className="avatar-core">
                <BotIcon className="avatar-icon" />
              </div>
            </div>

            {/* Agent Info */}
            <h1
              className="text-gradient"
              style={{
                fontSize: 36,
                fontWeight: 800,
                margin: "0 0 8px",
                letterSpacing: "-0.5px",
              }}
            >
              Kababjees AI
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 15,
                margin: "0 0 8px",
                fontWeight: 500,
              }}
            >
              {AGENT_CONFIG.role}
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 13,
                margin: "0 0 40px",
                lineHeight: 1.5,
                maxWidth: 300,
                marginInline: "auto",
              }}
            >
              {AGENT_CONFIG.description}
            </p>

            {/* iOS-style Start Button */}
            <button
              id="start-call-btn"
              className="ios-btn-accept"
              onClick={startCall}
            >
              <PhoneIcon className="" style={{ width: 28, height: 28 } as any} />
            </button>
            <p style={{ marginTop: 12, fontSize: 16, fontWeight: 400 }}>Accept</p>
          </div>
        )}

        {/* ─── CONNECTING STATE ─── */}
        {state === "connecting" && (
          <div className="fade-in" style={{ textAlign: "center" }}>
            <div className="ios-avatar" style={{ marginBottom: 24, marginInline: "auto" }}>
              K
            </div>

            <h2 style={{ fontSize: 32, fontWeight: 400, marginBottom: 8 }}>{AGENT_CONFIG.name}</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>connecting...</p>


          </div>
        )}

        {/* ─── ACTIVE CALL STATE ─── */}
        {isActive && (
          <div
            className="fade-in"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "40px 20px",
              background: "#000",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
            }}
          >
            {/* Top Notification (Order Status) */}
            <div style={{ position: "absolute", top: 20, left: 20, right: 20, zIndex: 10 }}>
              {orderStatus !== "idle" && (
                <div className="ios-notification animate-slide-down">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">
                      {orderStatus === "processing" ? "Processing..." : "Order Confirmed"}
                    </span>
                    <span className="text-xs text-gray-400">now</span>
                  </div>
                  {lastOrder && (
                    <div className="text-[13px] text-gray-300">
                      {lastOrder.items?.map((i: any) => `${i.qty}x ${i.name}`).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Top: Info */}
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <h2 style={{ fontSize: 32, fontWeight: 400, margin: "0 0 8px", color: "#fff" }}>{AGENT_CONFIG.name}</h2>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }}>{formatDuration(callDuration)}</div>
            </div>

            {/* Middle: Avatar */}
            <div style={{ display: "flex", justifyContent: "center", flex: 1, alignItems: "center" }}>
              <div className="ios-avatar large">K</div>
            </div>

            {/* Bottom: Controls */}
            <div style={{ width: "100%", maxWidth: 320, margin: "0 auto", paddingBottom: 20 }}>
              {/* Dialpad-style grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px 10px", marginBottom: 40 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button className={`ios-control-btn ${isMuted ? "active" : ""}`} onClick={toggleMute}>
                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                  </button>
                  <span className="ios-control-label">mute</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button className="ios-control-btn disabled">
                    <KeypadIcon />
                  </button>
                  <span className="ios-control-label">keypad</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button className="ios-control-btn disabled">
                    <SpeakerIcon />
                  </button>
                  <span className="ios-control-label">speaker</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button className="ios-control-btn disabled">
                    <PlusIcon />
                  </button>
                  <span className="ios-control-label">add call</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button className="ios-control-btn disabled">
                    <VideoIcon />
                  </button>
                  <span className="ios-control-label">FaceTime</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button className="ios-control-btn disabled">
                    <ContactsIcon />
                  </button>
                  <span className="ios-control-label">contacts</span>
                </div>
              </div>

              {/* End Call Button */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  id="end-call-btn"
                  className="ios-btn-end"
                  onClick={endCall}
                >
                  <PhoneOffIcon style={{ width: 32, height: 32 }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── ENDED STATE ─── */}
        {state === "ended" && (
          <div className="fade-in" style={{ textAlign: "center", maxWidth: 400 }}>
            <div className="avatar-container" style={{ marginBottom: 24 }}>
              <div className="avatar-core" style={{ opacity: 0.6 }}>
                <BotIcon className="avatar-icon" />
              </div>
            </div>

            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                margin: "0 0 8px",
                color: "var(--text-primary)",
              }}
            >
              Call Ended
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                margin: "0 0 4px",
              }}
            >
              Duration: {formatDuration(callDuration)}
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 13,
                margin: "0 0 32px",
              }}
            >
              Thanks for talking with {AGENT_CONFIG.name}
            </p>

            <button
              className="btn-call btn-start"
              onClick={() => window.location.reload()}
            >
              <RefreshIcon />
              Call Again
            </button>
          </div>
        )}

        {/* ─── ERROR STATE ─── */}
        {state === "error" && (
          <div className="fade-in" style={{ textAlign: "center", maxWidth: 400 }}>
            <div className="error-card">
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                Something went wrong
              </p>
              <p>{errorMessage || "An unexpected error occurred."}</p>
              <button
                className="btn-call btn-start"
                onClick={() => window.location.reload()}
                style={{ marginTop: 8 }}
              >
                <RefreshIcon />
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}