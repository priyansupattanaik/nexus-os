import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
} from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { TrendingUp, TrendingDown, Trash2, DollarSign } from "lucide-react";

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
    <div className="zenith-card h-full flex flex-col overflow-hidden">
      {/* Header / Balance */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Finance
          </h2>
          <div
            className={`text-3xl font-bold tracking-tight mt-1 ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            {currency}
            {balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Input Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description..."
              className="zenith-input flex-[2]"
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              className="zenith-input flex-1 text-right font-mono"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleAdd("income")}
              className="flex-1 zenith-btn bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
            >
              <TrendingUp className="w-4 h-4" /> Income
            </button>
            <button
              onClick={() => handleAdd("expense")}
              className="flex-1 zenith-btn bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
            >
              <TrendingDown className="w-4 h-4" /> Expense
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {txns.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-700">
                {t.description}
              </span>
              <div className="flex items-center gap-4">
                <span
                  className={`text-sm font-bold font-mono ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
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
                  className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {txns.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">
              No recent transactions
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
