import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/components/Login";
import ProfileModule from "@/components/ProfileModule";
import { useEffect, useState, Suspense, lazy } from "react";
import { checkSystemStatus, getAIBriefing } from "@/lib/api";
import VoiceCommand from "@/components/VoiceCommand";
import FocusMode from "@/components/FocusMode";
import OmniCommand from "@/components/OmniCommand";
import SubspaceStream from "@/components/SubspaceStream";
import { useSystemStore } from "@/lib/store";
import { Loader2, Power } from "lucide-react"; // Icons

// Lazy Loading
const CoreScene = lazy(() => import("@/components/3d/CoreScene"));
const TasksModule = lazy(() => import("@/components/TasksModule"));
const HabitsModule = lazy(() => import("@/components/HabitsModule"));
const FinanceModule = lazy(() => import("@/components/FinanceModule"));
const JournalModule = lazy(() => import("@/components/JournalModule"));
const MusicModule = lazy(() => import("@/components/MusicModule"));
const BioRegulator = lazy(() => import("@/components/BioRegulator"));
const Overclock = lazy(() => import("@/components/Overclock"));
const FrequencyTuner = lazy(() => import("@/components/FrequencyTuner"));
const DaemonPet = lazy(() => import("@/components/DaemonPet"));
const DreamDecoder = lazy(() => import("@/components/DreamDecoder"));

function Dashboard() {
  const { session } = useAuth();
  const { isFocusMode, setFocusMode, theme } = useSystemStore();
  const [status, setStatus] = useState("INITIALIZING...");
  const [briefing, setBriefing] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkSystemStatus().then((d) =>
      setStatus(d.status === "healthy" ? "ONLINE" : "OFFLINE"),
    );
  }, []);

  const handleBriefing = async () => {
    setIsProcessing(true);
    setBriefing("ESTABLISHING NEURAL LINK...");
    try {
      const data = await getAIBriefing(session.access_token);
      setBriefing(data.message);
    } catch {
      setBriefing("NEURAL UPLINK FAILED.");
    }
    setIsProcessing(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans theme-${theme} bg-black text-slate-200 pb-10 transition-colors duration-500`}
    >
      {/* Overlays */}
      <OmniCommand />
      <VoiceCommand />
      <SubspaceStream />
      {showProfile && (
        <ProfileModule
          user={session.user}
          onClose={() => setShowProfile(false)}
        />
      )}
      {isFocusMode && <FocusMode />}

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-3 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse shadow-[0_0_15px_hsl(var(--primary))]" />
          <span className="text-lg font-bold tracking-[0.3em] text-white font-mono">
            NEXUS<span className="text-[hsl(var(--primary))]">OS</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setFocusMode(true)}
            className="hidden md:flex items-center gap-2 text-[10px] tracking-widest text-[hsl(var(--primary))] hover:text-white transition-colors uppercase"
          >
            <Power className="w-3 h-3" /> Focus
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${status === "ONLINE" ? "bg-green-500" : "bg-red-500"} animate-pulse`}
            />
            <span className="text-[10px] font-bold tracking-widest font-mono text-slate-400">
              {status}
            </span>
          </div>
          <button
            onClick={() => setShowProfile(true)}
            className="relative group"
          >
            <div className="w-9 h-9 rounded-full border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] font-bold text-xs group-hover:bg-[hsl(var(--primary))] group-hover:text-black transition-all shadow-[0_0_10px_hsl(var(--primary)/0.2)]">
              {session.user.email?.[0].toUpperCase()}
            </div>
          </button>
        </div>
      </header>

      {/* Responsive BENTO GRID */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto w-full z-10">
        {/* Mobile: 1 Column
            Tablet: 2 Columns
            Desktop: 4 Columns
         */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          {/* 3D CORE - Spans 2x2 on Desktop */}
          <div className="col-span-1 md:col-span-2 xl:col-span-2 xl:row-span-2 min-h-[400px] relative glass-panel group">
            {/* AI Controls Overlay */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
              <h2 className="text-[hsl(var(--primary))] font-bold tracking-[0.2em] text-xs mb-2 uppercase opacity-70">
                Central Processing Unit
              </h2>
              <button
                onClick={handleBriefing}
                disabled={isProcessing}
                className="pointer-events-auto tech-button"
              >
                {isProcessing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "INITIATE BRIEFING"
                )}
              </button>
            </div>
            {/* Briefing Text */}
            {briefing && (
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/90 border-l-2 border-[hsl(var(--primary))] backdrop-blur-md max-w-xl animate-in fade-in slide-in-from-bottom-2 z-20">
                <p className="text-white font-mono text-xs md:text-sm leading-relaxed typing-effect">
                  <span className="text-[hsl(var(--primary))] mr-2">
                    {">>"}
                  </span>
                  {briefing}
                </p>
              </div>
            )}
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0 opacity-80 transition-opacity duration-1000 group-hover:opacity-100">
              <Suspense fallback={null}>
                <CoreScene />
              </Suspense>
            </div>
          </div>

          {/* Quick Stats & Utilities Column */}
          <div className="col-span-1 flex flex-col gap-6">
            <Suspense
              fallback={<div className="glass-panel h-40 animate-pulse" />}
            >
              <FinanceModule />
            </Suspense>
            <Suspense
              fallback={<div className="glass-panel h-40 animate-pulse" />}
            >
              <MusicModule />
            </Suspense>
          </div>

          {/* AI & Bio Column */}
          <div className="col-span-1 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Suspense fallback={<div className="glass-panel h-32" />}>
                <DaemonPet />
              </Suspense>
            </div>
            <div className="col-span-1">
              <Suspense fallback={<div className="glass-panel h-32" />}>
                <Overclock />
              </Suspense>
            </div>
            <div className="col-span-1">
              <Suspense fallback={<div className="glass-panel h-32" />}>
                <FrequencyTuner />
              </Suspense>
            </div>
            <div className="col-span-2">
              <Suspense fallback={<div className="glass-panel h-32" />}>
                <BioRegulator />
              </Suspense>
            </div>
          </div>

          {/* Productivity Row */}
          <div className="col-span-1 md:col-span-2 xl:col-span-2 min-h-[400px]">
            <Suspense
              fallback={<div className="glass-panel h-full animate-pulse" />}
            >
              <TasksModule />
            </Suspense>
          </div>

          <div className="col-span-1 xl:col-span-1 min-h-[400px]">
            <Suspense
              fallback={<div className="glass-panel h-full animate-pulse" />}
            >
              <HabitsModule />
            </Suspense>
          </div>

          <div className="col-span-1 xl:col-span-1 min-h-[400px]">
            <Suspense
              fallback={<div className="glass-panel h-full animate-pulse" />}
            >
              <JournalModule />
            </Suspense>
          </div>

          <div className="col-span-1 md:col-span-2 xl:col-span-1 min-h-[300px]">
            <Suspense
              fallback={<div className="glass-panel h-full animate-pulse" />}
            >
              <DreamDecoder />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-t-2 border-[hsl(var(--primary))] rounded-full animate-spin" />
      <div className="text-[hsl(var(--primary))] font-mono text-xs tracking-[0.3em] mt-6 animate-pulse">
        SYSTEM INITIALIZING...
      </div>
    </div>
  );
}

function AppContent() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return session ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
