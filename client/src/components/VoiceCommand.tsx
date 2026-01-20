import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { sendVoiceCommand } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export default function VoiceCommand() {
  const { session } = useAuth();
  const { setMode } = useSystemStore();

  // UI State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("OFFLINE");
  const [displayText, setDisplayText] = useState("");

  // Logic Refs (These persist without re-rendering)
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false); // Master Switch
  const isWakeWordRef = useRef(false); // Did we hear "Hey Nexus"?
  const silenceTimer = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Engine ONCE
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setDisplayText("VOICE NOT SUPPORTED");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // We handle the loop manually for better stability
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      if (isWakeWordRef.current) setMode("LISTENING");
    };

    recognition.onresult = (event: any) => {
      // Clear silence timer if user is talking
      if (silenceTimer.current) clearTimeout(silenceTimer.current);

      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      setDisplayText(transcript);

      // Phase 1: Waiting for Wake Word
      if (!isWakeWordRef.current) {
        if (transcript.includes("hey nexus") || transcript.includes("nexus")) {
          // WAKE UP!
          isWakeWordRef.current = true;
          setMode("LISTENING");
          setStatusText("LISTENING...");

          // Audio Feedback
          const audio = new Audio(
            "https://actions.google.com/sounds/v1/science_fiction/scifi_hightech_beep.ogg",
          );
          audio.volume = 0.5;
          audio.play().catch(() => {});
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      // If the loop is supposed to be active, restart it instantly
      if (isActiveRef.current) {
        // If we heard the wake word recently, check if we have a command
        if (isWakeWordRef.current && !isProcessing) {
          // Use a small delay to grab the final transcript state is tricky in refs,
          // so we rely on the logic that continuous processing happens elsewhere.
          // If we ended and are processing, do nothing.
          // If we ended and simply stopped speaking:
          // Check if we need to process a command
          // (Logic moved to silence timer for better flow)
        }

        // INSTANT RESTART (The "Infinite Loop")
        try {
          recognition.start();
        } catch {}
      } else {
        setMode("IDLE");
        setStatusText("OFFLINE");
      }
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      isActiveRef.current = false;
      recognition.stop();
    };
  }, []); // Dependency Array is EMPTY to prevent reloading

  // Handling the Command Logic via Effect to access latest State
  useEffect(() => {
    if (isWakeWordRef.current && displayText && !isProcessing) {
      // Debounce: Wait 1.5s of silence before sending command
      if (silenceTimer.current) clearTimeout(silenceTimer.current);

      silenceTimer.current = setTimeout(() => {
        const cleanCommand = displayText
          .replace("hey nexus", "")
          .replace("nexus", "")
          .trim();
        if (cleanCommand.length > 3) {
          executeCommand(cleanCommand);
        }
      }, 1500); // Wait 1.5 seconds after user stops talking
    }
  }, [displayText]);

  const toggleSystem = () => {
    if (isActiveRef.current) {
      // Turn OFF
      isActiveRef.current = false;
      isWakeWordRef.current = false;
      recognitionRef.current?.stop();
      setStatusText("OFFLINE");
      setDisplayText("");
      setMode("IDLE");
    } else {
      // Turn ON
      isActiveRef.current = true;
      recognitionRef.current?.start();
      setStatusText("STANDBY - SAY 'HEY NEXUS'");
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Attempt to find a better voice
    const voices = window.speechSynthesis.getVoices();
    const aiVoice = voices.find(
      (v) =>
        v.name.includes("Google US English") || v.name.includes("Samantha"),
    );
    if (aiVoice) utterance.voice = aiVoice;
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const executeCommand = async (cmd: string) => {
    setIsProcessing(true);
    setMode("PROCESSING");
    setStatusText("ANALYZING...");

    // Reset wake word so we don't loop
    isWakeWordRef.current = false;

    try {
      const data = await sendVoiceCommand(cmd, session?.access_token || "");
      setDisplayText(data.response);
      speak(data.response);
      setMode("SUCCESS");
    } catch (e) {
      setDisplayText("CONNECTION ERROR");
      setMode("ERROR");
    } finally {
      setIsProcessing(false);
      setStatusText("STANDBY");
      // Loop continues automatically via onend -> start
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {/* Holographic Feedback Panel */}
      {isActiveRef.current && (
        <div
          className={`holo-panel p-4 max-w-xs text-right animate-in fade-in slide-in-from-right-10 border-r-4 ${isWakeWordRef.current ? "border-r-nexus-accent" : "border-r-gray-600"}`}
        >
          <p className="text-xs text-nexus-subtext font-mono uppercase tracking-widest mb-1">
            {statusText}
          </p>
          <p className="text-nexus-text font-medium text-sm leading-relaxed min-h-[20px]">
            {displayText}
          </p>
        </div>
      )}

      {/* The Reactor Button */}
      <Button
        onClick={toggleSystem}
        className={`rounded-full w-16 h-16 border-2 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden group ${
          isActiveRef.current
            ? isWakeWordRef.current
              ? "bg-red-500/20 border-red-500 animate-pulse shadow-[0_0_50px_rgba(255,0,0,0.4)]"
              : "bg-nexus-accent/10 border-nexus-accent"
            : "bg-white/5 border-white/20 hover:border-nexus-accent"
        }`}
      >
        <div
          className={`absolute inset-0 border border-current rounded-full opacity-30 ${isWakeWordRef.current ? "animate-ping" : ""}`}
        />
        <span className="relative z-10 text-2xl">
          {isActiveRef.current ? (isWakeWordRef.current ? "●" : "👂") : "🔇"}
        </span>
      </Button>
    </div>
  );
}
