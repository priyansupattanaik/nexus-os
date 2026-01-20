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
    if (error) setMessage(`Error: ${error.message}`);
    else {
      setMessage("Password updated successfully.");
      setPassword("");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Force reload to clear state
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-sm p-6 space-y-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-nexus-accent to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg border border-white/20">
            {user.email?.[0].toUpperCase()}
          </div>
          <h2 className="text-lg font-semibold text-white truncate">
            {user.email}
          </h2>
          <p className="text-nexus-subtext text-xs font-mono mt-1">
            ID: {user.id.slice(0, 8)}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/5">
            <label className="text-[10px] font-bold text-nexus-subtext uppercase tracking-widest">
              Security
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input h-9 text-sm"
              />
              <Button
                onClick={updatePassword}
                disabled={loading || !password}
                className="glass-button h-9 text-xs"
              >
                {loading ? "..." : "Update"}
              </Button>
            </div>
            {message && (
              <p className="text-xs text-nexus-accent mt-2">{message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 h-10"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
