import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendVoiceCommand } from "@/lib/api";

export default function VoiceCommand() {
  const [listening, setListening] = useState(false);
  const [response, setResponse] = useState("");

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support voice.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.start();
    setListening(true);
    setResponse("Listening...");

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript;
      setResponse(`Processing: "${command}"...`);
      setListening(false);

      const data = await sendVoiceCommand(command);
      setResponse(data.response);

      // Text-to-Speech Response
      const speech = new SpeechSynthesisUtterance(data.response);
      window.speechSynthesis.speak(speech);
    };

    recognition.onerror = () => {
      setListening(false);
      setResponse("Voice input failed.");
    };
  };

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {response && (
        <div className="bg-black/80 border border-blue-500/50 text-blue-200 px-4 py-2 rounded-lg backdrop-blur-md max-w-xs text-right text-sm font-mono animate-in fade-in slide-in-from-right-5">
          {response}
        </div>
      )}
      <Button
        onClick={startListening}
        className={`rounded-full w-14 h-14 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 transition-all ${
          listening
            ? "bg-red-500 border-red-400 animate-pulse"
            : "bg-blue-600 border-blue-400 hover:scale-110"
        }`}
      >
        {listening ? "●" : "🎤"}
      </Button>
    </div>
  );
}
