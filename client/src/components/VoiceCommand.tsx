import { useState, useEffect, useRef } from "react";
import { sendVoiceCommand } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Mic, MicOff, Activity } from "lucide-react";

export default function VoiceCommand() {
  const { session } = useAuth();
  const { setMode } = useSystemStore();
  const [isListening, setIsListening] = useState(false);
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
    if (isWakeWordRef.current && displayText) {
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
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {isActiveRef.current && (
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl max-w-xs text-right animate-in fade-in slide-in-from-right-10 shadow-2xl">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-2">
            {isWakeWordRef.current ? "LISTENING" : "STANDBY"}
            <span
              className={`w-2 h-2 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-slate-500"}`}
            />
          </p>
          <p className="text-white font-medium text-sm leading-relaxed">
            {displayText}
          </p>
        </div>
      )}

      <button
        onClick={toggleSystem}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-md border ${isActiveRef.current ? "bg-blue-500 text-white border-blue-400 scale-110 shadow-blue-500/30" : "bg-white/10 text-slate-300 border-white/20 hover:bg-white/20"}`}
      >
        {isActiveRef.current ? (
          isWakeWordRef.current ? (
            <Activity className="w-8 h-8 animate-pulse" />
          ) : (
            <Mic className="w-7 h-7" />
          )
        ) : (
          <MicOff className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
