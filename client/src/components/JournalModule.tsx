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
          className={`p-2 rounded-xl border transition-all duration-300 ${isRecording ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "border-white/10 text-slate-400 hover:text-white hover:bg-white/10"}`}
        >
          {isRecording ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>
      }
    >
      <div className="flex flex-col h-full p-5 gap-5">
        <div className="flex gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isRecording ? "Listening to neural input..." : "Log entry..."
            }
            className="os-input flex-1 min-h-[70px] resize-none leading-relaxed"
          />
          <button onClick={handlePost} className="os-btn os-btn-primary px-4">
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {entries.map((e) => (
            <div
              key={e.id}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl relative group hover:bg-white/10 transition-all"
            >
              <p className="text-sm text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                {e.content}
              </p>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {new Date(e.created_at).toLocaleDateString()} •{" "}
                  {new Date(e.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  onClick={async () => {
                    await deleteEntry(e.id, session.access_token);
                    loadData();
                  }}
                  className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
