import { useEffect, useState } from "react";

export default function SubspaceStream() {
  const [headlines, setHeadlines] = useState<string[]>([
    "CONNECTING TO SUBSPACE...",
  ]);

  useEffect(() => {
    // Fetch Top Stories from Hacker News
    fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
      .then((res) => res.json())
      .then((ids) => {
        const top5 = ids.slice(0, 5);
        return Promise.all(
          top5.map((id: number) =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
              (r) => r.json(),
            ),
          ),
        );
      })
      .then((items) => {
        const titles = items
          .map((i: any) => `[${i.type.toUpperCase()}] ${i.title}`)
          .join("  +++  ");
        setHeadlines([titles]);
      })
      .catch(() => setHeadlines(["OFFLINE MODE - UNABLE TO SYNC WORLD DATA"]));
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-6 bg-black border-t border-[var(--nexus-accent)]/30 flex items-center overflow-hidden z-50">
      <div className="bg-[var(--nexus-accent)] px-3 h-full flex items-center text-[10px] font-bold text-black uppercase tracking-wider z-10">
        Stream
      </div>
      <div className="whitespace-nowrap flex animate-marquee">
        <span className="text-[10px] font-mono text-[var(--nexus-accent)] mx-4">
          {headlines}
        </span>
        {/* Duplicate for seamless loop */}
        <span className="text-[10px] font-mono text-[var(--nexus-accent)] mx-4">
          {headlines}
        </span>
      </div>
    </div>
  );
}
