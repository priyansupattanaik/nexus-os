import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchJournal, createEntry, deleteEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this or use standard textarea

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
    } catch (e) {
      console.error(e);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    await createEntry(content, session.access_token);
    setContent("");
    loadData();
  };

  return (
    <div className="flex flex-col h-full bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
      <h2 className="text-white font-semibold mb-3">Captain's Log</h2>

      <div className="flex gap-2 mb-4">
        {/* If Textarea UI component is missing, use standard textarea with class */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Log entry..."
          className="flex-1 bg-black/20 border border-white/10 rounded-md p-2 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={2}
        />
        <Button
          onClick={handlePost}
          className="h-auto bg-nexus-accent hover:bg-nexus-accent/80"
        >
          Post
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {entries.length === 0 && (
          <div className="text-gray-500 text-xs text-center mt-10">
            No entries yet.
          </div>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className="p-3 rounded-xl bg-black/20 border border-white/5 relative group"
          >
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {e.content}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-gray-500 font-mono">
                {new Date(e.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={async () => {
                  await deleteEntry(e.id, session.access_token);
                  loadData();
                }}
                className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
