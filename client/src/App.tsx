import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/components/Login";
import ProfileModule from "@/components/ProfileModule";
import { useEffect, useState } from "react";
import { checkSystemStatus, getAIBriefing } from "@/lib/api";
import CoreScene from "@/components/3d/CoreScene";
import TasksModule from "@/components/TasksModule";
import HabitsModule from "@/components/HabitsModule";
import FinanceModule from "@/components/FinanceModule";
import JournalModule from "@/components/JournalModule"; // <<< NEW IMPORT
import VoiceCommand from "@/components/VoiceCommand";
import { Button } from "@/components/ui/button";

function Dashboard() {
  const { session } = useAuth();
  const [status, setStatus] = useState("Initializing...");
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
    setBriefing("Establishing Neural Link...");
    await new Promise((r) => setTimeout(r, 1000));
    const data = await getAIBriefing();
    setBriefing(data.message);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans selection:bg-nexus-accent/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Elements */}
      <VoiceCommand />
      {showProfile && (
        <ProfileModule
          user={session.user}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* --- Apple-Style Glass Header --- */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-black/5 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-nexus-accent shadow-[0_0_10px_#0A84FF]" />
          <span className="text-lg font-semibold tracking-wide text-white/90">
            NEXUS OS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`hidden md:flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${status === "ONLINE" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
          >
            SYSTEM: {status}
          </div>
          <button
            onClick={() => setShowProfile(true)}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-nexus-accent to-purple-600 p-[1px] hover:scale-105 transition-transform"
          >
            <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white">
              {session.user.email?.[0].toUpperCase()}
            </div>
          </button>
        </div>
      </header>

      {/* --- Main Bento Grid Layout --- */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[400px_auto] gap-6 h-full">
          {/* HERO: Glass Tesseract */}
          <div className="glass-panel col-span-1 md:col-span-2 relative overflow-hidden group min-h-[350px]">
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white mb-1">
                Neural Core
              </h2>
              <Button
                onClick={handleBriefing}
                disabled={isProcessing}
                className="glass-button w-fit text-xs border border-white/20"
              >
                {isProcessing ? "Processing..." : "Initialize Briefing"}
              </Button>
            </div>
            {briefing && (
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-sm md:text-base leading-relaxed text-gray-200 animate-in fade-in slide-in-from-bottom-4 z-20 max-w-2xl">
                <span className="text-nexus-accent font-bold text-xs uppercase tracking-wider block mb-2">
                  Intelligence Report
                </span>
                {briefing}
              </div>
            )}
            <div className="absolute inset-0 z-0 opacity-80 transition-opacity duration-1000 group-hover:opacity-100">
              <CoreScene />
            </div>
          </div>

          {/* FINANCE MODULE */}
          <div className="glass-panel col-span-1 min-h-[300px] md:min-h-auto flex flex-col">
            <div className="flex-1 overflow-hidden p-1">
              <div className="h-full [&>div]:h-full [&>div]:bg-transparent [&>div]:border-none [&>div]:shadow-none">
                <FinanceModule />
              </div>
            </div>
          </div>

          {/* TASKS MODULE */}
          <div className="glass-panel col-span-1 min-h-[400px] flex flex-col">
            <div className="flex-1 overflow-hidden p-1">
              <div className="h-full [&>div]:h-full [&>div]:bg-transparent [&>div]:border-none [&>div]:shadow-none">
                <TasksModule />
              </div>
            </div>
          </div>

          {/* HABITS MODULE */}
          <div className="glass-panel col-span-1 min-h-[400px] flex flex-col">
            <div className="flex-1 overflow-hidden p-1">
              <div className="h-full [&>div]:h-full [&>div]:bg-transparent [&>div]:border-none [&>div]:shadow-none">
                <HabitsModule />
              </div>
            </div>
          </div>

          {/* JOURNAL MODULE (Previously Locked) */}
          <div className="glass-panel col-span-1 min-h-[300px] flex flex-col">
            <div className="flex-1 overflow-hidden p-1">
              <div className="h-full [&>div]:h-full [&>div]:bg-transparent [&>div]:border-none [&>div]:shadow-none">
                <JournalModule />
              </div>
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
      <div className="w-12 h-12 border-4 border-nexus-accent/30 border-t-nexus-accent rounded-full animate-spin" />
      <p className="text-nexus-subtext text-xs tracking-[0.2em] mt-6 animate-pulse">
        LOADING OS
      </p>
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
