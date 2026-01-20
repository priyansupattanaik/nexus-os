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
import { Loader2, Command, Zap } from "lucide-react";

// Lazy Loading Modules
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
  const { isFocusMode, setFocusMode } = useSystemStore();
  const [status, setStatus] = useState("INIT...");
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
    setBriefing("CONNECTING...");
    try {
      const data = await getAIBriefing(session.access_token);
      setBriefing(data.message);
    } catch {
      setBriefing("CONNECTION LOST.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-16">
      {/* --- OVERLAYS --- */}
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

      {/* --- TOP BAR (macOS Style) --- */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/5 transition-all">
        {/* Brand */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" />
          <span className="text-lg font-bold tracking-wider text-slate-100 font-sans">
            NEXUS
          </span>
        </div>

        {/* Quick Actions (Windows Tray Style) */}
        <div className="flex items-center gap-3">
          {/* Focus Toggle */}
          <button
            onClick={() => setFocusMode(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
          >
            <Zap className="w-3 h-3 text-yellow-400" /> Focus
          </button>

          {/* System Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div
              className={`w-1.5 h-1.5 rounded-full ${status === "ONLINE" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500"}`}
            />
            <span className="text-[10px] font-bold tracking-widest text-slate-400">
              {status}
            </span>
          </div>

          {/* Profile Avatar */}
          <button
            onClick={() => setShowProfile(true)}
            className="relative group ml-2"
          >
            <div className="w-9 h-9 rounded-full border border-white/10 bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover:scale-105 transition-transform">
              {session.user.email?.[0].toUpperCase()}
            </div>
          </button>
        </div>
      </header>

      {/* --- DESKTOP GRID --- */}
      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
          {/* CORE / AI - Top Left (4 cols) */}
          <div className="col-span-1 md:col-span-12 xl:col-span-8 h-[400px] os-panel overflow-hidden group relative">
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
              <h2 className="text-blue-300 font-bold tracking-widest text-[10px] mb-3 uppercase">
                Neural Core
              </h2>
              <button
                onClick={handleBriefing}
                disabled={isProcessing}
                className="pointer-events-auto os-btn os-btn-primary px-4 py-2 text-[10px]"
              >
                {isProcessing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "RUN DIAGNOSTICS"
                )}
              </button>
            </div>

            {briefing && (
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 max-w-2xl animate-in fade-in slide-in-from-bottom-2 z-20 shadow-2xl">
                <p className="text-slate-200 font-mono text-sm leading-relaxed">
                  <span className="text-blue-400 mr-2">➜</span>
                  {briefing}
                </p>
              </div>
            )}

            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
              <Suspense fallback={null}>
                <CoreScene />
              </Suspense>
            </div>
          </div>

          {/* QUICK UTILS - Right Side (4 cols) */}
          <div className="col-span-1 md:col-span-6 xl:col-span-4 flex flex-col gap-6">
            <div className="h-48">
              <Suspense
                fallback={<div className="os-panel h-full animate-pulse" />}
              >
                <MusicModule />
              </Suspense>
            </div>
            <div className="h-48">
              <Suspense
                fallback={<div className="os-panel h-full animate-pulse" />}
              >
                <FinanceModule />
              </Suspense>
            </div>
          </div>

          {/* BIO ROW (Full Width or Split) */}
          <div className="col-span-1 md:col-span-6 xl:col-span-3">
            <Suspense fallback={<div className="os-panel h-40" />}>
              <DaemonPet />
            </Suspense>
          </div>
          <div className="col-span-1 md:col-span-4 xl:col-span-3">
            <Suspense fallback={<div className="os-panel h-40" />}>
              <BioRegulator />
            </Suspense>
          </div>
          <div className="col-span-1 md:col-span-4 xl:col-span-3">
            <Suspense fallback={<div className="os-panel h-40" />}>
              <Overclock />
            </Suspense>
          </div>
          <div className="col-span-1 md:col-span-4 xl:col-span-3">
            <Suspense fallback={<div className="os-panel h-40" />}>
              <FrequencyTuner />
            </Suspense>
          </div>

          {/* WORKSPACE ROW */}
          <div className="col-span-1 md:col-span-6 xl:col-span-4 h-[500px]">
            <Suspense
              fallback={<div className="os-panel h-full animate-pulse" />}
            >
              <TasksModule />
            </Suspense>
          </div>

          <div className="col-span-1 md:col-span-6 xl:col-span-4 h-[500px]">
            <Suspense
              fallback={<div className="os-panel h-full animate-pulse" />}
            >
              <JournalModule />
            </Suspense>
          </div>

          <div className="col-span-1 md:col-span-12 xl:col-span-4 flex flex-col gap-6 h-[500px]">
            <div className="flex-1">
              <Suspense fallback={<div className="os-panel h-full" />}>
                <HabitsModule />
              </Suspense>
            </div>
            <div className="h-40">
              <Suspense fallback={<div className="os-panel h-full" />}>
                <DreamDecoder />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="text-blue-400 font-mono text-xs tracking-[0.3em] mt-8 uppercase opacity-80">
        Loading Nexus OS
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
