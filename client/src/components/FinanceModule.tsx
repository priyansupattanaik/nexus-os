import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
} from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { DollarSign, TrendingUp, TrendingDown, Trash2 } from "lucide-react";

export default function FinanceModule() {
  const { session } = useAuth();
  const { triggerPulse } = useSystemStore();
  const [txns, setTxns] = useState<any[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("$");

  useEffect(() => {
    if (session) {
      loadData();
      try {
        const userLocale = navigator.language;
        if (userLocale === "en-IN" || userLocale === "hi-IN") setCurrency("₹");
        else if (userLocale.includes("GB")) setCurrency("£");
        else if (userLocale.includes("EU")) setCurrency("€");
      } catch {}
    }
  }, [session]);

  const loadData = async () => {
    try {
      setTxns(await fetchTransactions(session.access_token));
    } catch (e) {}
  };

  const handleAdd = async (type: "income" | "expense") => {
    if (!desc || !amount) return;
    await addTransaction(
      { description: desc, amount: parseFloat(amount), type },
      session.access_token,
    );
    setDesc("");
    setAmount("");
    triggerPulse("success");
    loadData();
  };

  const balance = txns.reduce(
    (acc, t) => (t.type === "income" ? acc + t.amount : acc - t.amount),
    0,
  );

  return (
    <GlassCard
      title="Ledger"
      icon={<DollarSign />}
      action={
        <span
          className={`text-lg font-bold tracking-tight ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
        >
          {currency}
          {balance.toFixed(2)}
        </span>
      }
    >
      <div className="flex flex-col h-full p-5 gap-5">
        {/* Input Area */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Transaction details..."
              className="os-input flex-[2]"
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              className="os-input flex-1 font-mono text-right"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleAdd("income")}
              className="flex-1 os-btn bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40"
            >
              <TrendingUp className="w-3 h-3" /> Credit
            </button>
            <button
              onClick={() => handleAdd("expense")}
              className="flex-1 os-btn bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/40"
            >
              <TrendingDown className="w-3 h-3" /> Debit
            </button>
          </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1">
          {txns.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all group"
            >
              <span className="text-sm text-slate-300 font-medium truncate">
                {t.description}
              </span>
              <div className="flex items-center gap-4">
                <span
                  className={`font-mono text-sm font-semibold ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {currency}
                  {t.amount}
                </span>
                <button
                  onClick={async () => {
                    await deleteTransaction(t.id, session.access_token);
                    loadData();
                  }}
                  className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
