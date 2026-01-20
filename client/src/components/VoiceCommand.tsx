import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { sendVoiceCommand } from "@/lib/api";
import { useSystemStore } from "@/lib/store";

export default function VoiceCommand() {
  const { setMode } = useSystemStore(); // <<< Connect to Neural Link
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef<any>(null);

  // Initialize Speech
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setListening(true);
        setMode("LISTENING"); // <<< Tell Core to turn RED
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        setTranscript(event.results[current][0].transcript);
      };

      recognition.onend = async () => {
        setListening(false);
        if (transcript) {
          handleCommand(transcript);
        } else {
          setMode("IDLE"); // Reset if silence
        }
      };

      recognitionRef.current = recognition;
    }
  }, [transcript]);

  const speak = (text: string) => {
    // Robust Speech Engine
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);

    // Force Voice Load
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
    setMode("PROCESSING"); // <<< Tell Core to turn PURPLE
    setResponse("ANALYZING...");

    try {
      const data = await sendVoiceCommand(command);
      setResponse(data.response);
      speak(data.response); // <<< Speak Result
      setMode("SUCCESS"); // <<< Tell Core to Flash GREEN

      // Reset after success
      setTimeout(() => setMode("IDLE"), 2000);
    } catch (e) {
      setMode("ERROR");
      setResponse("CONNECTION FAILED.");
    } finally {
      setProcessing(false);
      setTranscript("");
    }
  };

  const toggleListen = () => {
    if (listening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setResponse("");
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {(transcript || response) && (
        <div className="holo-panel p-4 max-w-xs text-right animate-in fade-in slide-in-from-right-10 border-r-4 border-r-nexus-accent">
          <p className="text-xs text-nexus-subtext font-mono uppercase tracking-widest mb-1">
            {processing
              ? "PROCESSING DATA..."
              : listening
                ? "LISTENING..."
                : "SYSTEM RESPONSE"}
          </p>
          <p className="text-nexus-text font-medium text-sm leading-relaxed">
            {transcript || response}
          </p>
        </div>
      )}

      <Button
        onClick={toggleListen}
        className={`rounded-full w-16 h-16 border-2 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden group ${
          listening
            ? "bg-red-500/20 border-red-500 animate-pulse shadow-[0_0_50px_rgba(255,0,0,0.4)]"
            : "bg-nexus-accent/10 border-nexus-accent hover:bg-nexus-accent/20 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,243,255,0.4)]"
        }`}
      >
        <div
          className={`absolute inset-0 border border-current rounded-full opacity-30 ${listening ? "animate-ping" : "scale-75"}`}
        />
        <span className="relative z-10 text-2xl">{listening ? "●" : "🎤"}</span>
      </Button>
    </div>
  );
}
