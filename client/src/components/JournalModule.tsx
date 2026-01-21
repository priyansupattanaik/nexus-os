import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { fetchJournal, createEntry, deleteEntry } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { Mic, MicOff, Send, Trash2, Book } from "lucide-react";

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
    <div className="zenith-card h-full flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Book className="w-4 h-4" /> Personal Log
        </h2>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Record your thoughts..."
            className="zenith-input w-full min-h-[100px] resize-none pr-10 leading-relaxed text-gray-700"
          />
          <button
            onClick={toggleRecord}
            className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${isRecording ? "bg-rose-50 text-rose-500 animate-pulse" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
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
          className="zenith-btn zenith-btn-primary px-4 self-end h-[100px] flex flex-col items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold">Log</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {entries.map((e) => (
          <div
            key={e.id}
            className="p-5 bg-gray-50 border border-gray-100 rounded-xl relative group hover:bg-white hover:shadow-md transition-all"
          >
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {e.content}
            </p>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
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
                className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-4">Log is empty</p>
        )}
      </div>
    </div>
  );
}
