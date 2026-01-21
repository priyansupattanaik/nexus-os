import { useAuth } from "@/lib/auth";
import { User, Shield, LogOut, Wifi, X } from "lucide-react";

export default function ProfileModule({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const { signOut } = useAuth();

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden scale-in-95 animate-in">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            User Identity
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col p-8 items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-sky-50 border-4 border-white shadow-xl flex items-center justify-center relative">
            <span className="text-4xl font-bold text-sky-600">
              {user.email?.[0].toUpperCase()}
            </span>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{user.email}</h2>
            <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-widest">
              ID: {user.id.slice(0, 8)}...
            </p>
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">
                  Security
                </div>
                <div className="text-sm font-bold text-gray-900">Encrypted</div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <Wifi className="w-5 h-5 text-sky-500" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">
                  Network
                </div>
                <div className="text-sm font-bold text-gray-900">Secure</div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-200 rounded-xl font-bold uppercase text-xs tracking-widest transition-all"
          >
            <LogOut className="w-4 h-4" /> Disconnect Session
          </button>
        </div>
      </div>
    </div>
  );
}
