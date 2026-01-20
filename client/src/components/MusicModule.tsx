import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSystemStore } from "@/lib/store";

// Cyberpunk Playlist (Royalty Free Demos)
const TRACKS = [
  {
    title: "Neon Drive",
    artist: "System Core",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Cyber Rain",
    artist: "Neural Net",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Void Echo",
    artist: "Deep Space",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export default function MusicModule() {
  const { triggerPulse } = useSystemStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio(TRACKS[currentTrack].url);
    audioRef.current.volume = volume;

    // Auto-play next track
    audioRef.current.addEventListener("ended", nextTrack);

    // Update Progress Bar
    const interval = setInterval(() => {
      if (audioRef.current) {
        const pct =
          (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(pct || 0);
      }
    }, 1000);

    return () => {
      audioRef.current?.pause();
      clearInterval(interval);
    };
  }, [currentTrack]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
      triggerPulse("neutral");
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % TRACKS.length;
    setCurrentTrack(next);
    setIsPlaying(true);
    triggerPulse("success");
  };

  const prevTrack = () => {
    const prev = (currentTrack - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrack(prev);
    setIsPlaying(true);
    triggerPulse("neutral");
  };

  const handleVolume = (e: any) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  return (
    <div className="flex flex-col h-full bg-nexus-panel/50 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.1)] relative group">
      {/* Visualizer Background */}
      <div className="absolute inset-0 flex items-end justify-between opacity-10 pointer-events-none px-2 pb-2">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-nexus-accent transition-all duration-300"
            style={{ height: isPlaying ? `${Math.random() * 80 + 10}%` : "5%" }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="p-4 border-b border-nexus-border/30 bg-black/20 flex justify-between items-center z-10">
        <h2 className="text-nexus-accent font-bold tracking-widest text-sm uppercase">
          Sonic Deck
        </h2>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${isPlaying ? "bg-nexus-success animate-pulse" : "bg-nexus-subtext"}`}
          />
          <span className="text-[10px] font-mono text-nexus-subtext">
            {isPlaying ? "ACTIVE" : "IDLE"}
          </span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 z-10 space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-white font-bold text-lg tracking-wide truncate max-w-[200px]">
            {TRACKS[currentTrack].title}
          </h3>
          <p className="text-nexus-subtext text-xs uppercase tracking-widest">
            {TRACKS[currentTrack].artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-nexus-accent transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={prevTrack}
            className="holo-button w-10 h-10 rounded-full p-0"
          >
            ⏮
          </Button>
          <Button
            onClick={togglePlay}
            className="holo-button w-14 h-14 rounded-full p-0 text-xl border-nexus-accent bg-nexus-accent/10 hover:bg-nexus-accent/20 hover:scale-105 shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          >
            {isPlaying ? "⏸" : "▶"}
          </Button>
          <Button
            onClick={nextTrack}
            className="holo-button w-10 h-10 rounded-full p-0"
          >
            ⏭
          </Button>
        </div>
      </div>

      {/* Playlist & Volume */}
      <div className="p-3 bg-black/40 border-t border-white/5 z-10 space-y-3">
        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-nexus-subtext">VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolume}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-nexus-accent"
          />
        </div>

        {/* Mini Playlist */}
        <div className="space-y-1">
          {TRACKS.map((t, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentTrack(i);
                setIsPlaying(true);
              }}
              className={`text-[10px] font-mono p-1 rounded cursor-pointer flex justify-between hover:bg-white/5 ${currentTrack === i ? "text-nexus-accent" : "text-nexus-subtext"}`}
            >
              <span>
                {i + 1}. {t.title}
              </span>
              <span>{currentTrack === i && "◄"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
