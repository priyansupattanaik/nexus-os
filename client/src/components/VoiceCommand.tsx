import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { sendVoiceCommand } from "@/lib/api";

export default function VoiceCommand() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Set to false to auto-stop after speaking
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setListening(true);

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognition.onend = async () => {
        setListening(false);
        if (transcript) {
          await handleCommand(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [transcript]); // Re-bind if needed, though mostly stable

  const handleCommand = async (command: string) => {
    setProcessing(true);
    setResponse("Analyzing...");

    // Send to Llama 3 AI
    const data = await sendVoiceCommand(command);
    setResponse(data.response);
    setProcessing(false);
    setTranscript("");

    // Enhanced Text-to-Speech (Human-like tuning)
    const speech = new SpeechSynthesisUtterance(data.response);
    const voices = window.speechSynthesis.getVoices();

    // Try to find a good "AI" voice (Google US English or similar)
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Google US English") || v.name.includes("Samantha"),
    );
    if (preferredVoice) speech.voice = preferredVoice;

    speech.rate = 1.1; // Slightly faster
    speech.pitch = 0.9; // Slightly deeper
    window.speechSynthesis.speak(speech);
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
      {/* Holographic Text Bubble */}
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

      {/* The Reactor Button */}
      <Button
        onClick={toggleListen}
        className={`rounded-full w-16 h-16 border-2 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden group ${
          listening
            ? "bg-red-500/20 border-red-500 animate-pulse shadow-[0_0_50px_rgba(255,0,0,0.4)]"
            : "bg-nexus-accent/10 border-nexus-accent hover:bg-nexus-accent/20 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,243,255,0.4)]"
        }`}
      >
        {/* Animated Rings inside button */}
        <div
          className={`absolute inset-0 border border-current rounded-full opacity-30 ${listening ? "animate-ping" : "scale-75"}`}
        />
        <span className="relative z-10 text-2xl">{listening ? "●" : "🎤"}</span>
      </Button>
    </div>
  );
}
