import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { sendVoiceCommand } from "@/lib/api"; // Re-using the AI endpoint
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
      // We prepend a system instruction to the prompt
      const prompt = `Analyze this dream or abstract idea and provide a cryptic, cyberpunk-style interpretation or actionable insight: "${input}"`;
      const res = await sendVoiceCommand(prompt, session.access_token);
      setAnalysis(res.response);
    } catch (e) {
      setAnalysis("ERROR: NEURAL LINK FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="holo-panel flex flex-col p-4 h-full relative">
      <h2 className="text-[var(--nexus-accent)] font-bold tracking-widest text-[10px] uppercase mb-3">
        Dream / Idea Decoder
      </h2>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input raw data stream (Dream or Idea)..."
        className="flex-1 bg-black/30 border-white/10 text-xs font-mono mb-2 resize-none"
      />

      {analysis && (
        <div className="mb-2 p-2 bg-[var(--nexus-secondary)]/10 border border-[var(--nexus-secondary)]/30 rounded text-[10px] font-mono text-gray-300 h-24 overflow-y-auto custom-scrollbar">
          <span className="text-[var(--nexus-secondary)] mr-2">{">>"}</span>
          {analysis}
        </div>
      )}

      <Button
        onClick={handleDecode}
        disabled={loading}
        className="w-full h-8 text-[10px] holo-button border-[var(--nexus-accent)]"
      >
        {loading ? "PROCESSING..." : "DECODE"}
      </Button>
    </div>
  );
}
