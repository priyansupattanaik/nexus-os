import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/ui/GlassCard";
import { User, Shield, LogOut, Wifi } from "lucide-react";

export default function ProfileModule({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const { signOut } = useAuth();

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-md p-4">
        <GlassCard title="Identity" icon={<User />}>
          <div className="flex flex-col p-6 items-center gap-6 relative">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-2 text-slate-500 hover:text-white"
            >
              ✕
            </button>

            <div className="w-20 h-20 rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <span className="text-3xl font-bold text-[hsl(var(--primary))]">
                {user.email?.[0].toUpperCase()}
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">{user.email}</h2>
              <p className="text-xs font-mono text-[hsl(var(--primary))] tracking-widest uppercase">
                ID: {user.id.slice(0, 8)}...
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              <div className="bg-white/5 p-3 rounded border border-white/10 flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-400" />
                <div className="text-xs">
                  <div className="text-slate-400">Security</div>
                  <div className="text-white font-bold">Encrypted</div>
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10 flex items-center gap-3">
                <Wifi className="w-4 h-4 text-[hsl(var(--primary))]" />
                <div className="text-xs">
                  <div className="text-slate-400">Uplink</div>
                  <div className="text-white font-bold">Active</div>
                </div>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:border-red-500 rounded font-bold uppercase text-xs tracking-widest transition-all"
            >
              <LogOut className="w-4 h-4" /> Disconnect
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
