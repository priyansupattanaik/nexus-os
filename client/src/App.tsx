import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/components/Login";
import { useState, Suspense, lazy } from "react";
import { useSystemStore } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import VoiceCommand from "@/components/VoiceCommand";
import ProfileModule from "@/components/ProfileModule";
import ContextMenu from "@/components/ContextMenu";
import { Loader2, Menu } from "lucide-react";

// Lazy Load Modules
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
const ExplorerModule = lazy(() => import("@/components/ExplorerModule"));
const SettingsModule = lazy(() => import("@/components/SettingsModule"));
const TerminalModule = lazy(() => import("@/components/TerminalModule"));

function Dashboard() {
  const { session } = useAuth();
  const { activeTab } = useSystemStore();
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 md:pb-0">
            <div className="xl:col-span-2 h-96">
              <Suspense fallback={<LoadingCard />}>
                <TasksModule />
              </Suspense>
            </div>
            <div className="h-96">
              <Suspense fallback={<LoadingCard />}>
                <DaemonPet />
              </Suspense>
            </div>
            <div className="h-80">
              <Suspense fallback={<LoadingCard />}>
                <FinanceModule />
              </Suspense>
            </div>
            <div className="h-80">
              <Suspense fallback={<LoadingCard />}>
                <HabitsModule />
              </Suspense>
            </div>
            <div className="h-80">
              <Suspense fallback={<LoadingCard />}>
                <MusicModule />
              </Suspense>
            </div>
          </div>
        );
      case "explorer":
        return (
          <div className="h-full pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <ExplorerModule />
            </Suspense>
          </div>
        );
      case "settings":
        return (
          <div className="h-full pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <SettingsModule />
            </Suspense>
          </div>
        );
      case "terminal":
        return (
          <div className="h-full max-w-3xl mx-auto pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <TerminalModule />
            </Suspense>
          </div>
        );
      case "tasks":
        return (
          <div className="h-full pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <TasksModule />
            </Suspense>
          </div>
        );
      case "finance":
        return (
          <div className="max-w-4xl mx-auto pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <FinanceModule />
            </Suspense>
          </div>
        );
      case "habits":
        return (
          <div className="max-w-4xl mx-auto pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <HabitsModule />
            </Suspense>
          </div>
        );
      case "journal":
        return (
          <div className="h-full pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <JournalModule />
            </Suspense>
          </div>
        );
      case "bio":
        return (
          <div className="max-w-2xl mx-auto mt-10 h-96 pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <BioRegulator />
            </Suspense>
          </div>
        );
      case "focus":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 md:pb-0">
            <div className="h-96">
              <Suspense fallback={<LoadingCard />}>
                <Overclock />
              </Suspense>
            </div>
            <div className="h-96">
              <Suspense fallback={<LoadingCard />}>
                <FrequencyTuner />
              </Suspense>
            </div>
          </div>
        );
      case "analysis":
        return (
          <div className="max-w-3xl mx-auto h-[500px] pb-20 md:pb-0">
            <Suspense fallback={<LoadingCard />}>
              <DreamDecoder />
            </Suspense>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-sans flex overflow-hidden">
      <ContextMenu />

      {/* Desktop Sidebar */}
      <Sidebar onOpenProfile={() => setShowProfile(true)} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-white animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onOpenProfile={() => setShowProfile(true)} />
          </div>
        </div>
      )}

      {showProfile && (
        <ProfileModule
          user={session.user}
          onClose={() => setShowProfile(false)}
        />
      )}

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen relative">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 bg-white rounded-lg border border-gray-200 text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab.replace("-", " ")}
              </h1>
              <p className="text-sm text-gray-500 hidden md:block">
                System Operational • All Systems Green
              </p>
            </div>
          </div>
          <VoiceCommand />
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="w-full h-full bg-white rounded-2xl border border-gray-200 flex items-center justify-center shadow-sm">
      <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      <div className="mt-4 text-sky-600 font-medium tracking-widest text-xs uppercase">
        Initializing Zenith OS
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
