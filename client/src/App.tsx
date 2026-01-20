import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/components/Login";
import ProfileModule from "@/components/ProfileModule";
import { useEffect, useState, Suspense, lazy } from "react";
import { checkSystemStatus, getAIBriefing } from "@/lib/api";
import VoiceCommand from "@/components/VoiceCommand";
import FocusMode from "@/components/FocusMode";
import { Button } from "@/components/ui/button";
import { useSystemStore } from "@/lib/store";

// --- OPTIMIZATION: Lazy Load Heavy Modules ---
const CoreScene = lazy(() => import("@/components/3d/CoreScene"));
const TasksModule = lazy(() => import("@/components/TasksModule"));
const HabitsModule = lazy(() => import("@/components/HabitsModule"));
const FinanceModule = lazy(() => import("@/components/FinanceModule"));
const JournalModule = lazy(() => import("@/components/JournalModule"));

function Dashboard() {
  const { session } = useAuth();
  const { isFocusMode, setFocusMode } = useSystemStore();
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
    await new Promise((r) => setTimeout(r, 800));
    const data = await getAIBriefing(session.access_token);
    setBriefing(data.message);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-nexus-accent/30 selection:text-black">
      {/* --- OVERLAYS --- */}
      <VoiceCommand />
      {showProfile && (
        <ProfileModule
          user={session.user}
          onClose={() => setShowProfile(false)}
        />
      )}
      {isFocusMode && <FocusMode />}

      {/* --- Holographic Header --- */}
      <header className="sticky top-0 z-50 px-6 py-3 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-nexus-border/20 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-nexus-accent animate-pulse shadow-[0_0_10px_#00f3ff]" />
          <span className="text-xl font-bold tracking-[0.2em] text-nexus-text uppercase font-mono">
            NEXUS<span className="text-nexus-accent text-sm">OS</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Focus Mode Trigger */}
          <Button
            onClick={() => setFocusMode(true)}
            className="hidden md:flex h-8 text-[10px] tracking-widest bg-nexus-secondary/10 border border-nexus-secondary/50 text-nexus-secondary hover:bg-nexus-secondary/20 uppercase"
          >
            Focus Mode
          </Button>

          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded border bg-black/40 ${status === "ONLINE" ? "border-nexus-success/30 text-nexus-success" : "border-nexus-danger/30 text-nexus-danger"}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${status === "ONLINE" ? "bg-nexus-success" : "bg-nexus-danger"} animate-pulse`}
            />
            <span className="text-[10px] font-bold tracking-widest font-mono">
              SYS::{status}
            </span>
          </div>

          <button
            onClick={() => setShowProfile(true)}
            className="relative group"
          >
            <div className="w-9 h-9 rounded border border-nexus-accent/30 bg-nexus-accent/5 flex items-center justify-center text-nexus-accent font-bold text-xs group-hover:bg-nexus-accent/20 group-hover:border-nexus-accent transition-all shadow-[0_0_10px_rgba(0,243,255,0.1)]">
              {session.user.email?.[0].toUpperCase()}
            </div>
            <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-nexus-accent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-nexus-accent opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </header>

      {/* --- Main Grid (Lazy Loaded) --- */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[450px_auto] gap-6">
          <Suspense
            fallback={
              <div className="holo-panel min-h-[400px] animate-pulse bg-white/5" />
            }
          >
            {/* CORE SCENE */}
            <div className="holo-panel col-span-1 md:col-span-2 relative group min-h-[400px] border-nexus-accent/30">
              <div className="absolute top-6 left-6 z-20">
                <h2 className="text-nexus-accent font-bold tracking-[0.2em] text-xs mb-2 uppercase opacity-70">
                  Central Processing Unit
                </h2>
                <Button
                  onClick={handleBriefing}
                  disabled={isProcessing}
                  className="holo-button text-[10px] px-4 py-2 h-auto border-nexus-accent/50 flex items-center gap-2"
                >
                  <span
                    className={`w-1.5 h-1.5 bg-nexus-accent rounded-full ${isProcessing ? "animate-ping" : ""}`}
                  />
                  {isProcessing
                    ? "ANALYZING DATASTREAM..."
                    : "INITIATE BRIEFING"}
                </Button>
              </div>
              {briefing && (
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 border-l-2 border-nexus-accent backdrop-blur-md max-w-xl animate-in fade-in slide-in-from-bottom-2 z-20">
                  <p className="text-nexus-text font-mono text-sm leading-relaxed">
                    <span className="text-nexus-accent mr-2">{">>"}</span>
                    {briefing}
                  </p>
                </div>
              )}
              <div className="absolute inset-0 z-0 opacity-80 transition-opacity duration-1000 group-hover:opacity-100">
                <CoreScene />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            </div>
          </Suspense>

          <Suspense
            fallback={
              <div className="holo-panel min-h-[300px] animate-pulse bg-white/5" />
            }
          >
            <div className="col-span-1 min-h-[300px]">
              <FinanceModule />
            </div>
          </Suspense>
          <Suspense
            fallback={
              <div className="holo-panel min-h-[400px] animate-pulse bg-white/5" />
            }
          >
            <div className="col-span-1 min-h-[400px]">
              <TasksModule />
            </div>
          </Suspense>
          <Suspense
            fallback={
              <div className="holo-panel min-h-[400px] animate-pulse bg-white/5" />
            }
          >
            <div className="col-span-1 min-h-[400px]">
              <HabitsModule />
            </div>
          </Suspense>
          <Suspense
            fallback={
              <div className="holo-panel min-h-[300px] animate-pulse bg-white/5" />
            }
          >
            <div className="col-span-1 min-h-[300px]">
              <JournalModule />
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-holo-grid opacity-20" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-t-2 border-nexus-accent rounded-full animate-spin shadow-[0_0_20px_rgba(0,243,255,0.2)]" />
        <div className="text-nexus-text font-mono text-xs tracking-[0.3em] animate-pulse">
          SYSTEM INITIALIZING...
        </div>
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
