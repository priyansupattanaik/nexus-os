import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { sendVoiceCommand } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export default function VoiceCommand() {
  const { session } = useAuth();
  const { setMode } = useSystemStore();

  const [active, setActive] = useState(false); // Master switch
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Engine
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // We restart manually to keep it robust
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        // Only visual feedback if we are actively processing a command,
        // otherwise we are just silently listening for wake word.
        if (wakeWordDetected) setMode("LISTENING");
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript.toLowerCase();
        setTranscript(text);

        // Wake Word Logic
        if (
          !wakeWordDetected &&
          (text.includes("hey nexus") || text.includes("nexus"))
        ) {
          setWakeWordDetected(true);
          setMode("LISTENING");
          // Play a sci-fi activation sound
          const audio = new Audio(
            "https://actions.google.com/sounds/v1/science_fiction/scifi_hightech_beep.ogg",
          );
          audio.play().catch(() => {});
        }
      };

      recognition.onend = () => {
        if (wakeWordDetected && transcript && !processing) {
          // We have a command!
          const commandText = transcript
            .replace("hey nexus", "")
            .replace("nexus", "")
            .trim();
          if (commandText.length > 2) {
            handleCommand(commandText);
          } else {
            // Spoken wake word but no command yet
            // Keep waiting (restart)
            recognition.start();
          }
        } else if (active && !processing) {
          // Just restart the loop to keep listening for wake word
          recognition.start();
        } else {
          setMode("IDLE");
        }
      };

      recognitionRef.current = recognition;
    }
  }, [active, wakeWordDetected, transcript, processing]);

  const startListeningLoop = () => {
    setActive(true);
    setResponse("VOICE SYSTEM ACTIVE. SAY 'HEY NEXUS'");
    recognitionRef.current?.start();
  };

  const stopListeningLoop = () => {
    setActive(false);
    setWakeWordDetected(false);
    setTranscript("");
    setResponse("VOICE SYSTEM STANDBY");
    recognitionRef.current?.stop();
    setMode("IDLE");
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    let voices = window.speechSynthesis.getVoices();
    const selectVoice = () => {
      const preferred = voices.find(
        (v) =>
          v.name.includes("Google US English") || v.name.includes("Samantha"),
      );
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.1;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    };

    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        selectVoice();
      };
    } else {
      selectVoice();
    }
  };

  const handleCommand = async (command: string) => {
    setProcessing(true);
    setMode("PROCESSING");
    setResponse("ANALYZING...");

    try {
      // <<< UPDATED: Pass token to AI >>>
      const data = await sendVoiceCommand(command, session?.access_token || "");

      setResponse(data.response);
      speak(data.response);
      setMode("SUCCESS");

      // Reset state after command is done
      setTimeout(() => {
        setWakeWordDetected(false); // Go back to waiting for wake word
        setProcessing(false);
        setTranscript("");
        setMode("IDLE");
        // Loop restarts automatically via onend
      }, 4000); // Wait for speech to finish roughly
    } catch (e) {
      setMode("ERROR");
      setResponse("CONNECTION FAILED.");
      setProcessing(false);
      setWakeWordDetected(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {(transcript || response) && active && (
        <div className="holo-panel p-4 max-w-xs text-right animate-in fade-in slide-in-from-right-10 border-r-4 border-r-nexus-accent">
          <p className="text-xs text-nexus-subtext font-mono uppercase tracking-widest mb-1">
            {processing
              ? "PROCESSING..."
              : wakeWordDetected
                ? "LISTENING..."
                : "STANDBY"}
          </p>
          <p className="text-nexus-text font-medium text-sm leading-relaxed">
            {transcript || response}
          </p>
        </div>
      )}

      <Button
        onClick={active ? stopListeningLoop : startListeningLoop}
        className={`rounded-full w-16 h-16 border-2 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden group ${
          active
            ? wakeWordDetected
              ? "bg-red-500/20 border-red-500 animate-pulse"
              : "bg-nexus-accent/20 border-nexus-accent"
            : "bg-white/5 border-white/20 hover:border-nexus-accent"
        }`}
      >
        <div
          className={`absolute inset-0 border border-current rounded-full opacity-30 ${wakeWordDetected ? "animate-ping" : ""}`}
        />
        <span className="relative z-10 text-2xl">
          {active ? (wakeWordDetected ? "●" : "👂") : "🔇"}
        </span>
      </Button>
    </div>
  );
}
