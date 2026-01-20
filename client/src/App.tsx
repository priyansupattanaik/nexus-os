import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/components/Login";
import { useEffect, useState } from "react";
import { checkSystemStatus, getAIBriefing } from "@/lib/api";
import CoreScene from "@/components/3d/CoreScene";
import TasksModule from "@/components/TasksModule";
import HabitsModule from "@/components/HabitsModule"; // <<< NEW
import FinanceModule from "@/components/FinanceModule"; // <<< NEW
import VoiceCommand from "@/components/VoiceCommand"; // <<< NEW
import { Button } from "@/components/ui/button";

function Dashboard() {
  const { session } = useAuth();
  const [status, setStatus] = useState("Checking...");
  const [briefing, setBriefing] = useState("");

  useEffect(() => {
    checkSystemStatus().then((d) =>
      setStatus(d.status === "healthy" ? "ONLINE" : "OFFLINE"),
    );
  }, []);

  const handleCoreClick = async () => {
    setBriefing("Analyzing...");
    const data = await getAIBriefing();
    setBriefing(data.message);
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white p-6 flex flex-col gap-6 overflow-hidden relative">
      <VoiceCommand /> {/* Voice Button Floating */}
      {/* Header */}
      <header className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest">NEXUS OS</h1>
          <p className="text-xs text-gray-500 font-mono">
            USER: {session.user.email}
          </p>
        </div>
        <div className="text-xs px-2 py-1 rounded border border-green-500 text-green-400">
          CORE: {status}
        </div>
      </header>
      {/* Main Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 h-[calc(100vh-140px)]">
        {/* Left Column: Core + AI */}
        <section className="col-span-1 lg:col-span-1 flex flex-col gap-6">
          <div className="relative bg-black/50 border border-gray-800 rounded-lg overflow-hidden flex-1 min-h-[300px]">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCoreClick}
              className="absolute top-4 left-4 z-10 bg-nexus-accent/20 text-blue-200 border border-blue-500/50"
            >
              Initialize Briefing
            </Button>
            <div className="absolute inset-0">
              <CoreScene />
            </div>
            {briefing && (
              <div className="absolute bottom-4 left-4 right-4 p-4 border border-blue-500/30 bg-black/80 backdrop-blur-sm rounded text-sm text-gray-200 font-mono">
                {briefing}
              </div>
            )}
          </div>
        </section>

        {/* Middle Column: Productivity */}
        <section className="col-span-1 flex flex-col gap-6 h-full overflow-hidden">
          <div className="flex-1 min-h-0">
            <TasksModule />
          </div>
          <div className="flex-1 min-h-0">
            <HabitsModule />
          </div>
        </section>

        {/* Right Column: Finance + Journal (Placeholder) */}
        <section className="col-span-1 flex flex-col gap-6 h-full overflow-hidden">
          <div className="flex-1 min-h-0">
            <FinanceModule />
          </div>
          <div className="h-1/3 bg-black/40 border border-white/10 rounded-xl p-6 shadow-2xl flex items-center justify-center text-gray-500">
            Journal Module Locked
          </div>
        </section>
      </main>
    </div>
  );
}

function AppContent() {
  const { session, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-nexus-dark text-white">
        Initializing...
      </div>
    );
  return session ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
