import { useState } from "react";
import { supabase } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfileModule({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updatePassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) setMessage(`ERR: ${error.message}`);
    else {
      setMessage("CREDENTIALS UPDATED");
      setPassword("");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="holo-panel w-full max-w-sm p-6 space-y-6 relative shadow-[0_0_50px_rgba(0,243,255,0.1)] border-t-2 border-t-nexus-accent">
        {/* Decorative scanline */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nexus-accent to-transparent opacity-50" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-nexus-subtext hover:text-nexus-accent transition-colors font-mono text-xs"
        >
          [ CLOSE ]
        </button>

        <div className="text-center pt-2">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full border border-nexus-accent/30 p-1 relative group">
            <div className="absolute inset-0 rounded-full border border-nexus-accent/30 animate-spin-slow" />
            <div className="w-full h-full rounded-full bg-nexus-accent/10 flex items-center justify-center text-2xl font-bold text-nexus-accent shadow-[0_0_15px_rgba(0,243,255,0.2)]">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
          <h2 className="text-lg font-bold text-nexus-text tracking-widest uppercase">
            {user.email}
          </h2>
          <p className="text-nexus-subtext text-[10px] font-mono mt-1 tracking-widest">
            ID: {user.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 p-4 bg-black/40 rounded border border-white/5">
            <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-widest">
              Security Protocol
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="NEW PASSKEY"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="holo-input h-8 text-xs"
              />
              <Button
                onClick={updatePassword}
                disabled={loading || !password}
                className="holo-button h-8 text-[10px]"
              >
                {loading ? "..." : "UPDATE"}
              </Button>
            </div>
            {message && (
              <p className="text-[10px] text-nexus-accent mt-2 font-mono border-l-2 border-nexus-accent pl-2">
                {message}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-white/5">
            <Button
              onClick={handleLogout}
              className="w-full bg-nexus-danger/10 text-nexus-danger border border-nexus-danger/50 hover:bg-nexus-danger/20 hover:shadow-[0_0_20px_rgba(255,0,85,0.3)] h-10 tracking-widest uppercase text-xs font-bold transition-all"
            >
              Terminate Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
