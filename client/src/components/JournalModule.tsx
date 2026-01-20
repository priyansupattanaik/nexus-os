import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { fetchJournal, createEntry, deleteEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useSystemStore } from "@/lib/store";

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

  // Setup Speech Recognition
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
        // Append to content, not replace
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
      setContent(""); // Clear for new entry or keep? Let's clear to be safe
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    if (isRecording) toggleRecord(); // Stop recording if active

    await createEntry(content, session.access_token);
    setContent("");
    triggerPulse("success");
    loadData();
  };

  const handleDelete = async (id: string) => {
    triggerPulse("error");
    await deleteEntry(id, session.access_token);
    loadData();
  };

  return (
    <div className="flex flex-col h-full bg-nexus-panel/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-nexus-border/30 bg-black/20 flex justify-between items-center">
        <h2 className="text-white font-bold tracking-widest text-sm uppercase">
          Journal
        </h2>
        <button
          onClick={toggleRecord}
          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isRecording ? "bg-red-500 border-red-500 animate-pulse text-white" : "border-white/20 text-gray-500 hover:text-white"}`}
        >
          {isRecording ? "■" : "🎤"}
        </button>
      </div>

      <div className="p-3 flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isRecording ? "Listening..." : "Log entry..."}
          className="flex-1 holo-input min-h-[50px] resize-none text-xs"
          rows={2}
        />
        <Button
          onClick={handlePost}
          className="holo-button h-auto text-[10px] flex flex-col items-center justify-center px-2"
        >
          <span>LOG</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {entries.map((e) => (
          <div
            key={e.id}
            className="p-3 rounded border border-white/10 bg-black/20 relative group hover:border-[var(--nexus-accent)]/30 transition-colors"
          >
            <p className="text-xs text-white font-mono whitespace-pre-wrap leading-relaxed">
              {e.content}
            </p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
              <span className="text-[10px] text-gray-500 font-mono uppercase">
                {new Date(e.created_at).toLocaleString()}
              </span>
              <button
                onClick={() => handleDelete(e.id)}
                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
              >
                [PURGE]
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
