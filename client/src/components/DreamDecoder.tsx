import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { sendVoiceCommand } from "@/lib/api";
import { Send, Loader2, Sparkles } from "lucide-react";

export default function DreamDecoder() {
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAnalysis("Establishing neural link...");
    try {
      const prompt = `Analyze this dream or thought pattern and provide a deep, psychological or strategic insight: "${input}"`;
      const res = await sendVoiceCommand(prompt, session.access_token);
      setAnalysis(res.response);
    } catch (e) {
      setAnalysis("Connection interrupted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-5 gap-4 bg-black/20">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input dream sequence or abstract thought..."
        className="os-input flex-1 min-h-[120px] resize-none leading-relaxed"
      />

      {analysis && (
        <div className="p-4 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-blue-200 leading-relaxed shadow-inner max-h-[200px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-2 text-violet-400 font-bold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3" /> Analysis
          </div>
          {analysis}
        </div>
      )}

      <button
        onClick={handleDecode}
        disabled={loading}
        className="os-btn os-btn-primary w-full"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" /> Decode Pattern
          </>
        )}
      </button>
    </div>
  );
}
