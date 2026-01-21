import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { fetchJournal, createEntry, deleteEntry } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { Mic, MicOff, Send, Trash2 } from "lucide-react";

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
    <div className="flex flex-col h-full p-4 gap-4 bg-black/20">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Log entry..."
            className="os-input w-full min-h-[80px] resize-none pr-8"
          />
          <button
            onClick={toggleRecord}
            className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all ${isRecording ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-white"}`}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>
        <button
          onClick={handlePost}
          className="os-btn os-btn-primary px-3 self-end h-[80px]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {entries.map((e) => (
          <div
            key={e.id}
            className="p-3 bg-white/5 border border-white/5 rounded-lg relative group hover:bg-white/10 transition-all"
          >
            <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
              {e.content}
            </p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {new Date(e.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={async () => {
                  await deleteEntry(e.id, session.access_token);
                  loadData();
                }}
                className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
