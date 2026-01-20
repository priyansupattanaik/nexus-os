import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSystemStore } from "@/lib/store";

export default function FinanceModule() {
  const { session } = useAuth();
  const { triggerPulse } = useSystemStore();
  const [txns, setTxns] = useState<any[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (session) loadData();
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
    triggerPulse("success"); // Money moves trigger the system
    loadData();
  };

  const balance = txns.reduce(
    (acc, t) => (t.type === "income" ? acc + t.amount : acc - t.amount),
    0,
  );

  const handleDelete = async (id: string) => {
    triggerPulse("error");
    await deleteTransaction(id, session.access_token);
    loadData();
  };

  return (
    <div className="flex flex-col h-full bg-nexus-panel/50 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(0,255,157,0.1)]">
      <div className="p-4 border-b border-nexus-border/30 bg-black/20 flex justify-between items-end">
        <h2 className="text-nexus-accent font-bold tracking-widest text-sm uppercase">
          Ledger
        </h2>
        <div
          className={`text-xl font-mono font-bold ${balance >= 0 ? "text-nexus-success" : "text-nexus-danger"}`}
        >
          ${balance.toFixed(2)}
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Entry..."
            className="holo-input h-8 text-xs flex-[2]"
          />
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            type="number"
            className="holo-input h-8 text-xs flex-1"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleAdd("income")}
            className="flex-1 h-7 text-[10px] bg-nexus-success/10 text-nexus-success border border-nexus-success/30 hover:bg-nexus-success/20 uppercase"
          >
            Credit
          </Button>
          <Button
            onClick={() => handleAdd("expense")}
            className="flex-1 h-7 text-[10px] bg-nexus-danger/10 text-nexus-danger border border-nexus-danger/30 hover:bg-nexus-danger/20 uppercase"
          >
            Debit
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {txns.map((t) => (
          <div
            key={t.id}
            className="flex justify-between text-xs border-b border-white/5 pb-2 pt-1 font-mono hover:bg-white/5 px-2 rounded"
          >
            <span className="text-nexus-subtext">{t.description}</span>
            <div className="flex gap-3">
              <span
                className={
                  t.type === "income"
                    ? "text-nexus-success"
                    : "text-nexus-danger"
                }
              >
                {t.type === "income" ? "+" : "-"}${t.amount}
              </span>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-nexus-subtext hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
