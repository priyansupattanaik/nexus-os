import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function FinanceModule() {
  const { session } = useAuth();
  const [txns, setTxns] = useState<any[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  const loadData = async () => {
    try {
      setTxns(await fetchTransactions(session.access_token));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (type: "income" | "expense") => {
    if (!desc || !amount) return;
    await addTransaction(
      { description: desc, amount: parseFloat(amount), type },
      session.access_token,
    );
    setDesc("");
    setAmount("");
    loadData();
  };

  const balance = txns.reduce(
    (acc, t) => (t.type === "income" ? acc + t.amount : acc - t.amount),
    0,
  );

  return (
    <Card className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full flex flex-col shadow-2xl">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-semibold text-gray-300">Finance</h2>
        <div
          className={`text-2xl font-mono ${balance >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          ${balance.toFixed(2)}
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Item..."
          className="bg-gray-900/50 border-gray-700 text-white flex-[2]"
        />
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          type="number"
          className="bg-gray-900/50 border-gray-700 text-white flex-1"
        />
      </div>
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => handleAdd("income")}
          className="flex-1 bg-green-900/30 text-green-400 border border-green-700 hover:bg-green-900/50"
        >
          In
        </Button>
        <Button
          onClick={() => handleAdd("expense")}
          className="flex-1 bg-red-900/30 text-red-400 border border-red-700 hover:bg-red-900/50"
        >
          Out
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {txns.map((t) => (
          <div
            key={t.id}
            className="flex justify-between text-sm border-b border-gray-800 pb-1"
          >
            <span className="text-gray-400">{t.description}</span>
            <span
              className={
                t.type === "income" ? "text-green-500" : "text-red-500"
              }
            >
              {t.type === "income" ? "+" : "-"}${t.amount}
            </span>
            <button
              onClick={async () => {
                await deleteTransaction(t.id, session.access_token);
                loadData();
              }}
              className="text-gray-600 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
