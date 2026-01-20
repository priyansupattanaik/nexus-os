import { useState } from "react";
import { supabase } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("IDENTITY RECORDED. VERIFY EMAIL OR PROCEED.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setMessage(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-holo-grid opacity-20 pointer-events-none" />

      <div className="holo-panel w-full max-w-md p-8 space-y-8 relative z-10 border-t-4 border-t-nexus-accent">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-nexus-accent to-blue-500 animate-pulse">
            NEXUS OS
          </h1>
          <p className="text-nexus-subtext text-xs font-mono tracking-[0.3em]">
            SECURE TERMINAL ACCESS
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nexus-accent uppercase ml-1">
              Identity
            </label>
            <Input
              type="email"
              placeholder="USER@NEXUS.NET"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="holo-input"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nexus-accent uppercase ml-1">
              Passkey
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="holo-input"
              required
            />
          </div>

          {message && (
            <div className="text-nexus-danger text-xs text-center font-mono border border-nexus-danger/30 bg-nexus-danger/10 p-2 rounded">
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full holo-button h-12 text-sm"
            disabled={loading}
          >
            {loading
              ? "AUTHENTICATING..."
              : isSignUp
                ? "INITIALIZE NEW USER"
                : "ACCESS SYSTEM"}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
            }}
            className="text-xs text-nexus-subtext hover:text-nexus-accent transition-colors font-mono"
          >
            {isSignUp ? "[ BACK TO LOGIN ]" : "[ CREATE NEW IDENTITY ]"}
          </button>
        </div>
      </div>
    </div>
  );
}
