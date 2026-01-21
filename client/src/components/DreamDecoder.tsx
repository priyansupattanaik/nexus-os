import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { sendVoiceCommand } from "@/lib/api";
import { Send, Loader2, Sparkles, BrainCircuit } from "lucide-react";

export default function DreamDecoder() {
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAnalysis("Analyzing patterns...");
    try {
      const prompt = `Analyze this dream or abstract idea and provide a deep, psychological or strategic insight: "${input}"`;
      const res = await sendVoiceCommand(prompt, session.access_token);
      setAnalysis(res.response);
    } catch (e) {
      setAnalysis("Connection interrupted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zenith-card h-full flex flex-col p-6 gap-6 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <BrainCircuit className="w-5 h-5 text-sky-500" />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Neural Decoder
        </h2>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your dream or idea for analysis..."
        className="zenith-input flex-1 min-h-[120px] resize-none leading-relaxed text-gray-700 bg-white"
      />

      {analysis && (
        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 leading-relaxed shadow-inner max-h-[250px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 text-sky-600 font-bold uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4" /> Insight Generated
          </div>
          {analysis}
        </div>
      )}

      <button
        onClick={handleDecode}
        disabled={loading}
        className="zenith-btn zenith-btn-primary w-full py-3"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" /> Run Analysis
          </>
        )}
      </button>
    </div>
  );
}
