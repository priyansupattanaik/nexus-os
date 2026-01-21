import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Activity, CheckCircle, XCircle, Loader2, Bot } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function DebugConsole() {
  const { session } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/debug/run_diagnostics`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      setReport(data);
    } catch (e) {
      setReport({ error: "Failed to contact debug server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-500" /> System Diagnostics
        </h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="text-xs px-3 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Scanning..." : "Run Auto-Debug"}
        </button>
      </div>

      {report && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
          {/* Technical Checks */}
          <div className="grid grid-cols-2 gap-2">
            {report.technical_report?.checks &&
              Object.entries(report.technical_report.checks).map(
                ([key, val]: any) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                  >
                    <span className="text-xs uppercase font-bold text-gray-500">
                      {key}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold flex items-center gap-1 ${val.includes("PASS") ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {val.includes("PASS") ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {val}
                    </span>
                  </div>
                ),
              )}
          </div>

          {/* AI Analysis */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <Bot className="w-3 h-3" /> Nexus Analysis
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed font-medium">
              {report.ai_analysis || "Analysis pending..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
