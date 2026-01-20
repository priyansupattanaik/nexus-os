import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { sendVoiceCommand } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainCircuit, Send, Loader2 } from "lucide-react";

export default function DreamDecoder() {
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAnalysis("DECRYPTING NEURAL PATTERNS...");
    try {
      const prompt = `Analyze this dream or abstract idea and provide a cryptic, cyberpunk-style interpretation: "${input}"`;
      const res = await sendVoiceCommand(prompt, session.access_token);
      setAnalysis(res.response);
    } catch (e) {
      setAnalysis("ERROR: NEURAL LINK FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard title="Dream Decoder" icon={<BrainCircuit />}>
      <div className="flex flex-col h-full p-4 gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Input raw data stream..."
          className="tech-input flex-1 resize-none min-h-[80px]"
        />

        {analysis && (
          <div className="p-3 bg-[hsl(var(--secondary)/0.1)] border border-[hsl(var(--secondary)/0.3)] rounded text-xs font-mono text-slate-300 max-h-[120px] overflow-y-auto custom-scrollbar">
            <span className="text-[hsl(var(--secondary))] mr-2">{">>"}</span>
            {analysis}
          </div>
        )}

        <button
          onClick={handleDecode}
          disabled={loading}
          className="tech-button w-full border-[hsl(var(--secondary))] text-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.1)]"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-3 h-3" /> DECODE
            </div>
          )}
        </button>
      </div>
    </GlassCard>
  );
}
