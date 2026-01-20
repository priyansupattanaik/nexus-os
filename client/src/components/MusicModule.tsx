import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Volume2,
} from "lucide-react";
import { useSystemStore } from "@/lib/store";

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

  useEffect(() => {
    audioRef.current = new Audio(TRACKS[currentTrack].url);
    audioRef.current.volume = volume;
    audioRef.current.addEventListener("ended", nextTrack);

    const interval = setInterval(() => {
      if (audioRef.current) {
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0,
        );
      }
    }, 1000);

    return () => {
      audioRef.current?.pause();
      clearInterval(interval);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (isPlaying) audioRef.current?.pause();
    else {
      audioRef.current?.play();
      triggerPulse("neutral");
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((currentTrack + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleVolume = (e: any) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  return (
    <GlassCard title="Sonic Deck" icon={<Music />}>
      <div className="flex flex-col h-full p-4 justify-between relative">
        {/* Visualizer Background */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end justify-between px-4 opacity-20 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-[hsl(var(--primary))]"
              style={{
                height: isPlaying ? `${Math.random() * 80 + 20}%` : "10%",
                transition: "height 0.2s",
              }}
            />
          ))}
        </div>

        <div className="z-10 text-center space-y-1 mt-2">
          <h3 className="text-white font-bold text-sm truncate">
            {TRACKS[currentTrack].title}
          </h3>
          <p className="text-[hsl(var(--primary))] text-xs uppercase tracking-widest">
            {TRACKS[currentTrack].artist}
          </p>
        </div>

        {/* Controls */}
        <div className="z-10 flex flex-col gap-3">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--primary))]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevTrack}
              className="text-slate-400 hover:text-white"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-black transition-all"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="text-slate-400 hover:text-white"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3 text-slate-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolume}
              className="w-full h-1 accent-[hsl(var(--primary))]"
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
