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
import { Loader2 } from "lucide-react";

// OS Components
import Dock from "@/components/os/Dock";
import WindowFrame from "@/components/os/WindowFrame";

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
  const { isFocusMode, theme } = useSystemStore();
  const [briefing, setBriefing] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial Briefing (Optional on boot)
  useEffect(() => {
    // We could auto-run diagnostics here
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
    <div
      className={`h-screen w-screen overflow-hidden font-sans theme-${theme} bg-black text-slate-200 relative`}
    >
      {/* --- DESKTOP LAYER --- */}

      {/* 1. Wallpaper & Core */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] opacity-60">
          <Suspense fallback={null}>
            <CoreScene />
          </Suspense>
        </div>
      </div>

      {/* 2. Desktop Widgets (Fixed positions) */}
      <div className="absolute top-6 left-6 z-10">
        <div className="glass-panel p-4 w-64">
          <h2 className="text-[10px] font-bold tracking-widest text-blue-400 mb-2 uppercase">
            Neural Core
          </h2>
          <button
            onClick={handleBriefing}
            disabled={isProcessing}
            className="os-btn os-btn-primary w-full text-[10px]"
          >
            {isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "RUN DIAGNOSTICS"
            )}
          </button>
          {briefing && (
            <div className="mt-3 p-2 bg-black/40 rounded text-[10px] font-mono text-slate-300 max-h-40 overflow-y-auto">
              {briefing}
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10 w-48">
        <Suspense fallback={null}>
          <DaemonPet />
        </Suspense>
      </div>

      {/* --- WINDOW MANAGER LAYER --- */}
      <div className="absolute inset-0 z-20 pointer-events-none [&>*]:pointer-events-auto">
        {/* Productivity */}
        <WindowFrame
          id="tasks"
          title="Mission Control"
          width="500px"
          height="600px"
        >
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <TasksModule />
          </Suspense>
        </WindowFrame>

        <WindowFrame id="finance" title="Ledger" width="400px" height="500px">
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <FinanceModule />
          </Suspense>
        </WindowFrame>

        <WindowFrame id="habits" title="Protocols" width="350px" height="500px">
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <HabitsModule />
          </Suspense>
        </WindowFrame>

        <WindowFrame id="journal" title="Logbook" width="400px" height="600px">
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <JournalModule />
          </Suspense>
        </WindowFrame>

        {/* Media & Tools */}
        <WindowFrame id="music" title="Sonic Deck" width="350px" height="400px">
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <MusicModule />
          </Suspense>
        </WindowFrame>

        <WindowFrame id="dream" title="Decoder" width="400px" height="400px">
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <DreamDecoder />
          </Suspense>
        </WindowFrame>

        <WindowFrame id="bio" title="Bio-Sync" width="300px" height="350px">
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <BioRegulator />
          </Suspense>
        </WindowFrame>

        <WindowFrame
          id="overclock"
          title="Overclock"
          width="300px"
          height="300px"
        >
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <Overclock />
          </Suspense>
        </WindowFrame>

        <WindowFrame id="tuner" title="Tuner" width="300px" height="400px">
          <Suspense
            fallback={
              <div className="h-full w-full bg-black/50 animate-pulse" />
            }
          >
            <FrequencyTuner />
          </Suspense>
        </WindowFrame>
      </div>

      {/* --- UI OVERLAYS --- */}
      <Dock />
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
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
      <div className="text-blue-400 font-mono text-xs tracking-[0.3em] mt-8 uppercase opacity-80">
        Initializing OS...
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
