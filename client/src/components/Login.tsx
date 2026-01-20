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
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Account created! Please check your email to verify.");
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-nexus-accent/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Glass Panel */}
      <div className="glass-panel w-full max-w-md p-8 space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-nexus-subtext text-sm">
            {isSignUp
              ? "Enter your details to join NEXUS"
              : "Sign in to access your OS"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded border border-red-500/20">
              {error}
            </div>
          )}
          {message && (
            <div className="text-green-400 text-xs text-center bg-green-900/20 p-2 rounded border border-green-500/20">
              {message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full glass-button hover:bg-white/20 h-11"
            disabled={loading}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-xs text-nexus-subtext hover:text-white transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
