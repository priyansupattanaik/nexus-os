import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { fetchJournal, createEntry, deleteEntry } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Book, Mic, MicOff, Send, Trash2 } from "lucide-react";

export default function JournalModule() {
  const { session } = useAuth();
  const { triggerPulse } = useSystemStore();
  const [entries, setEntries] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (session) loadData();
  }, [session]);
  const loadData = async () => {
    try {
      setEntries(await fetchJournal(session.access_token));
    } catch (e) {}
  };

  // Speech to Text
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setContent((prev) => prev + " " + transcript);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecord = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setContent("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    if (isRecording) toggleRecord();
    await createEntry(content, session.access_token);
    setContent("");
    triggerPulse("success");
    loadData();
  };

  return (
    <GlassCard
      title="Log"
      icon={<Book />}
      action={
        <button
          onClick={toggleRecord}
          className={`p-2 rounded-full border transition-all ${isRecording ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse" : "border-white/10 text-slate-400 hover:text-white"}`}
        >
          {isRecording ? (
            <MicOff className="w-3 h-3" />
          ) : (
            <Mic className="w-3 h-3" />
          )}
        </button>
      }
    >
      <div className="flex flex-col h-full p-4 gap-4">
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Entry..."}
            className="tech-input flex-1 min-h-[60px] resize-none"
          />
          <button onClick={handlePost} className="tech-button px-3">
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="p-3 bg-white/[0.02] border border-white/5 rounded relative group hover:border-[hsl(var(--primary)/0.3)] transition-colors"
            >
              <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {e.content}
              </p>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  {new Date(e.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={async () => {
                    await deleteEntry(e.id, session.access_token);
                    loadData();
                  }}
                  className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
