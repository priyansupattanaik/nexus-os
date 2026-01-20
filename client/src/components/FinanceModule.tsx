import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
} from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
} from "lucide-react";

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
          className={`text-lg font-mono font-bold ${balance >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          {currency}
          {balance.toFixed(2)}
        </span>
      }
    >
      <div className="flex flex-col h-full p-4 gap-4">
        {/* Input Area */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Transaction..."
              className="tech-input flex-[2]"
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              className="tech-input flex-1"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAdd("income")}
              className="flex-1 tech-button border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <TrendingUp className="w-3 h-3" /> Credit
            </button>
            <button
              onClick={() => handleAdd("expense")}
              className="flex-1 tech-button border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <TrendingDown className="w-3 h-3" /> Debit
            </button>
          </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
          {txns.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5 transition-colors group border border-transparent hover:border-white/5"
            >
              <span className="text-slate-300 font-mono truncate">
                {t.description}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={
                    t.type === "income" ? "text-green-400" : "text-red-400"
                  }
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
                  className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
