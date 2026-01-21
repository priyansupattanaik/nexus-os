import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchFiles, createFile, deleteFile } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import {
  Folder,
  FileText,
  Plus,
  Trash2,
  Home,
  ArrowLeft,
  Loader2,
  HardDrive,
} from "lucide-react";

export default function ExplorerModule() {
  const { session } = useAuth();
  const { triggerPulse } = useSystemStore();
  const [files, setFiles] = useState<any[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: "Home" }]);
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isCreating, setIsCreating] = useState<"file" | "folder" | null>(null);

  useEffect(() => {
    if (session) loadFiles();
  }, [session, parentId]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fetchFiles(parentId, session.access_token);
      setFiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (folderId: string, folderName: string) => {
    setParentId(folderId);
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
  };

  const handleUp = () => {
    if (breadcrumbs.length <= 1) return;
    const newCrumbs = breadcrumbs.slice(0, -1);
    setBreadcrumbs(newCrumbs);
    setParentId(newCrumbs[newCrumbs.length - 1].id);
  };

  const handleCreate = async () => {
    if (!newItemName.trim() || !isCreating) return;
    try {
      await createFile(
        {
          name: newItemName,
          type: isCreating,
          parent_id: parentId,
          content: isCreating === "file" ? "New text file..." : null,
        },
        session.access_token,
      );
      setNewItemName("");
      setIsCreating(null);
      triggerPulse("success");
      loadFiles();
    } catch (e) {
      triggerPulse("error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this item?")) return;
    await deleteFile(id, session.access_token);
    triggerPulse("neutral");
    loadFiles();
  };

  return (
    <div className="zenith-card h-full flex flex-col overflow-hidden bg-white">
      {/* Header / Nav */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleUp}
            disabled={!parentId}
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 overflow-hidden">
            <HardDrive className="w-4 h-4 text-sky-500" />
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">/</span>}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? "text-gray-900 font-bold"
                      : ""
                  }
                >
                  {crumb.name}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCreating("folder")}
            className="zenith-btn px-3 py-1.5 text-xs bg-white border-gray-200 hover:bg-gray-50"
          >
            <Plus className="w-3 h-3" /> Folder
          </button>
          <button
            onClick={() => setIsCreating("file")}
            className="zenith-btn px-3 py-1.5 text-xs bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100"
          >
            <Plus className="w-3 h-3" /> Note
          </button>
        </div>
      </div>

      {/* Creation Bar */}
      {isCreating && (
        <div className="p-3 bg-sky-50 border-b border-sky-100 flex gap-2 animate-in slide-in-from-top-2">
          <input
            autoFocus
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Name your ${isCreating}...`}
            className="zenith-input flex-1 h-9 text-xs"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            className="zenith-btn zenith-btn-primary px-4 py-1 h-9"
          >
            Save
          </button>
          <button
            onClick={() => setIsCreating(null)}
            className="zenith-btn px-3 py-1 h-9"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Folder className="w-12 h-12 opacity-20" />
            <p className="text-sm">This directory is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() =>
                  file.type === "folder"
                    ? handleNavigate(file.id, file.name)
                    : null
                }
                className={`
                                group relative p-4 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer flex flex-col items-center gap-3 text-center
                                ${file.type === "file" ? "bg-white" : "bg-gray-50/50"}
                            `}
              >
                {/* Icon */}
                <div
                  className={`
                                w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110
                                ${file.type === "folder" ? "bg-sky-100 text-sky-600" : "bg-white border border-gray-100 text-gray-500"}
                            `}
                >
                  {file.type === "folder" ? (
                    <Folder className="w-6 h-6 fill-current" />
                  ) : (
                    <FileText className="w-6 h-6" />
                  )}
                </div>

                {/* Name */}
                <span className="text-xs font-medium text-gray-700 truncate w-full px-2">
                  {file.name}
                </span>

                {/* Delete Action */}
                <button
                  onClick={(e) => handleDelete(file.id, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
