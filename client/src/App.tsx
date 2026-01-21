import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/components/Login";
import { useState, Suspense, lazy } from "react";
import Sidebar from "@/components/Sidebar";
import VoiceCommand from "@/components/VoiceCommand";
import ProfileModule from "@/components/ProfileModule"; // <<< Import
import { Loader2 } from "lucide-react";

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

function Dashboard() {
  const { session } = useAuth(); // Need session for Profile
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfile, setShowProfile] = useState(false); // <<< State

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
      case "tasks":
        return (
          <div className="h-full">
            <Suspense fallback={<LoadingCard />}>
              <TasksModule />
            </Suspense>
          </div>
        );
      case "finance":
        return (
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<LoadingCard />}>
              <FinanceModule />
            </Suspense>
          </div>
        );
      case "habits":
        return (
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<LoadingCard />}>
              <HabitsModule />
            </Suspense>
          </div>
        );
      case "journal":
        return (
          <div className="h-full">
            <Suspense fallback={<LoadingCard />}>
              <JournalModule />
            </Suspense>
          </div>
        );
      case "bio":
        return (
          <div className="max-w-2xl mx-auto mt-10 h-96">
            <Suspense fallback={<LoadingCard />}>
              <BioRegulator />
            </Suspense>
          </div>
        );
      case "focus":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="max-w-3xl mx-auto h-[500px]">
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
    <div className="min-h-screen bg-[var(--bg-main)] font-sans flex">
      {/* Pass toggle handler */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setShowProfile(true)}
      />

      {/* Profile Modal Overlay */}
      {showProfile && (
        <ProfileModule
          user={session.user}
          onClose={() => setShowProfile(false)}
        />
      )}

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {activeTab.replace("-", " ")}
            </h1>
            <p className="text-sm text-gray-500">
              System Operational • All Systems Green
            </p>
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
