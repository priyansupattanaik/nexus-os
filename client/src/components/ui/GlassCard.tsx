import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function GlassCard({
  children,
  className,
  title,
  icon,
  action,
}: GlassCardProps) {
  return (
    <div className={cn("os-panel w-full h-full min-h-[220px]", className)}>
      {/* Header Area */}
      {(title || icon || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {/* Icon Bubble */}
            {icon && (
              <div className="p-1.5 rounded-lg bg-white/5 text-blue-300 border border-white/5 shadow-inner">
                <span className="w-4 h-4 block [&>svg]:w-full [&>svg]:h-full">
                  {icon}
                </span>
              </div>
            )}

            {title && (
              <h3 className="font-semibold text-sm text-slate-200 tracking-wide">
                {title}
              </h3>
            )}
          </div>

          {action && <div className="text-slate-400">{action}</div>}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col p-1">
        {children}
      </div>
    </div>
  );
}
