import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchJournal, createEntry, deleteEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function JournalModule() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (session) loadData();
  }, [session]);
  const loadData = async () => {
    try {
      setEntries(await fetchJournal(session.access_token));
    } catch (e) {}
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    await createEntry(content, session.access_token);
    setContent("");
    loadData();
  };

  return (
    <div className="flex flex-col h-full bg-nexus-panel/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-nexus-border/30 bg-black/20">
        <h2 className="text-white font-bold tracking-widest text-sm uppercase">
          System Logs
        </h2>
      </div>
      <div className="p-3 flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Input log entry..."
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
            className="p-3 rounded border border-white/10 bg-black/20 relative group hover:border-nexus-accent/30 transition-colors"
          >
            <p className="text-xs text-nexus-text font-mono whitespace-pre-wrap leading-relaxed">
              {e.content}
            </p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
              <span className="text-[10px] text-nexus-subtext font-mono uppercase">
                {new Date(e.created_at).toLocaleString()}
              </span>
              <button
                onClick={async () => {
                  await deleteEntry(e.id, session.access_token);
                  loadData();
                }}
                className="text-nexus-danger opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
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
