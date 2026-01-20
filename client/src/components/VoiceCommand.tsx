import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { sendVoiceCommand } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Mic, MicOff, Activity } from "lucide-react";

export default function VoiceCommand() {
  const { session } = useAuth();
  const { setMode } = useSystemStore();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);
  const isWakeWordRef = useRef(false);
  const silenceTimer = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      if (isWakeWordRef.current) setMode("LISTENING");
    };
    recognition.onresult = (event: any) => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      const transcript =
        event.results[event.resultIndex][0].transcript.toLowerCase();
      setDisplayText(transcript);
      if (
        !isWakeWordRef.current &&
        (transcript.includes("hey nexus") || transcript.includes("nexus"))
      ) {
        isWakeWordRef.current = true;
        setMode("LISTENING");
        new Audio(
          "https://actions.google.com/sounds/v1/science_fiction/scifi_hightech_beep.ogg",
        )
          .play()
          .catch(() => {});
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      if (isActiveRef.current)
        try {
          recognition.start();
        } catch {}
      else setMode("IDLE");
    };
    recognitionRef.current = recognition;
    return () => {
      isActiveRef.current = false;
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (isWakeWordRef.current && displayText && !isProcessing) {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        const cleanCommand = displayText
          .replace("hey nexus", "")
          .replace("nexus", "")
          .trim();
        if (cleanCommand.length > 3) executeCommand(cleanCommand);
      }, 1500);
    }
  }, [displayText]);

  const toggleSystem = () => {
    if (isActiveRef.current) {
      isActiveRef.current = false;
      isWakeWordRef.current = false;
      recognitionRef.current?.stop();
      setDisplayText("");
      setMode("IDLE");
    } else {
      isActiveRef.current = true;
      recognitionRef.current?.start();
    }
  };

  const executeCommand = async (cmd: string) => {
    setIsProcessing(true);
    setMode("PROCESSING");
    isWakeWordRef.current = false;
    try {
      const data = await sendVoiceCommand(cmd, session?.access_token || "");
      setDisplayText(data.response);
      const utterance = new SpeechSynthesisUtterance(data.response);
      window.speechSynthesis.speak(utterance);
      setMode("SUCCESS");
    } catch {
      setDisplayText("ERROR");
      setMode("ERROR");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {isActiveRef.current && (
        <div className="glass-panel p-4 max-w-xs text-right animate-in fade-in slide-in-from-right-10 border-r-4 border-[hsl(var(--primary))]">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-1 flex items-center justify-end gap-2">
            {isListening ? (
              <Activity className="w-3 h-3 animate-pulse text-green-500" />
            ) : (
              "OFFLINE"
            )}
            {isWakeWordRef.current ? "LISTENING" : "STANDBY"}
          </p>
          <p className="text-white font-medium text-sm leading-relaxed">
            {displayText}
          </p>
        </div>
      )}

      <Button
        onClick={toggleSystem}
        className={`rounded-full w-14 h-14 border transition-all duration-300 shadow-2xl flex items-center justify-center relative overflow-hidden group ${isActiveRef.current ? "bg-[hsl(var(--primary))/0.2] border-[hsl(var(--primary))]" : "bg-black/80 border-white/20 hover:border-[hsl(var(--primary))]"}`}
      >
        <span className="relative z-10 text-white">
          {isActiveRef.current ? (
            isWakeWordRef.current ? (
              <Activity className="w-6 h-6 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6" />
            )
          ) : (
            <MicOff className="w-6 h-6 text-slate-500" />
          )}
        </span>
      </Button>
    </div>
  );
}
