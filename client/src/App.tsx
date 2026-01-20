import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/components/Login";
import { useEffect, useState } from "react";
import { checkSystemStatus, getAIBriefing } from "@/lib/api";
import CoreScene from "@/components/3d/CoreScene";
import TasksModule from "@/components/TasksModule"; // <<< Import new module
import { Button } from "@/components/ui/button";

function Dashboard() {
  const { session } = useAuth();
  const [status, setStatus] = useState("Checking Core...");
  const [briefing, setBriefing] = useState("");
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    checkSystemStatus().then((data) => {
      setStatus(data.status === "healthy" ? "ONLINE" : "OFFLINE");
    });
  }, []);

  const handleCoreClick = async () => {
    setThinking(true);
    setBriefing("Analyzing system parameters...");

    // Artificial delay for effect
    await new Promise((r) => setTimeout(r, 800));

    const data = await getAIBriefing();
    setBriefing(data.message);
    setThinking(false);
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest">NEXUS OS</h1>
          <p className="text-xs text-gray-500 font-mono">
            USER: {session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`text-xs px-2 py-1 rounded border ${status === "ONLINE" ? "border-green-500 text-green-400" : "border-red-500 text-red-500"}`}
          >
            CORE: {status}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Sync
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* 3D Visualization Module */}
        <section className="col-span-1 relative bg-black/50 border border-gray-800 rounded-lg overflow-hidden h-[500px] md:h-auto">
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCoreClick}
              disabled={thinking}
              className="bg-nexus-accent/20 hover:bg-nexus-accent/40 text-blue-200 border border-blue-500/50"
            >
              {thinking ? "Processing..." : "Initialize Briefing"}
            </Button>
          </div>

          {/* The 3D Scene */}
          <div className="absolute inset-0">
            <CoreScene />
          </div>

          {/* AI Output Overlay */}
          {briefing && (
            <div className="absolute bottom-4 left-4 right-4 p-4 border border-blue-500/30 bg-black/80 backdrop-blur-sm rounded animate-in fade-in slide-in-from-bottom-2 z-20">
              <h3 className="text-blue-400 text-xs font-bold mb-1 tracking-widest uppercase">
                NEXUS INTELLIGENCE
              </h3>
              <p className="text-gray-200 font-mono text-sm leading-relaxed">
                {briefing}
              </p>
            </div>
          )}
        </section>

        {/* Directives (Tasks) Module - Replaces the old placeholders */}
        <section className="col-span-1 h-[500px] md:h-auto">
          <TasksModule />
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
        <div className="animate-pulse">Initializing System...</div>
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
