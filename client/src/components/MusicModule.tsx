import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music,
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
      if (audioRef.current)
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0,
        );
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
    <div className="zenith-card h-full flex flex-col p-6 justify-between relative overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
        <Music className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Sonic Deck
        </span>
      </div>

      {/* Visualizer */}
      <div className="absolute top-20 left-0 right-0 h-24 flex items-end justify-between px-8 opacity-20 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="w-2 rounded-t-sm bg-sky-500"
            style={{
              height: isPlaying ? `${Math.random() * 80 + 20}%` : "5%",
              transition: "height 0.2s ease",
            }}
          />
        ))}
      </div>

      <div className="z-10 text-center mt-4">
        <h3 className="text-gray-900 font-bold text-lg tracking-tight truncate">
          {TRACKS[currentTrack].title}
        </h3>
        <p className="text-sky-600 text-xs font-bold uppercase tracking-wider mt-1">
          {TRACKS[currentTrack].artist}
        </p>
      </div>

      <div className="z-10 flex flex-col gap-6 mb-2">
        {/* Progress */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={prevTrack}
            className="text-gray-400 hover:text-gray-800 transition-colors"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 hover:scale-105 transition-all shadow-xl shadow-gray-200"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="text-gray-400 hover:text-gray-800 transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-4">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolume}
            className="w-full h-1 accent-sky-500 bg-gray-100 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
