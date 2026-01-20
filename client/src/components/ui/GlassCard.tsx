import { ReactNode } from "react";
import { cn } from "@/lib/utils"; // Ensure you have standard shadcn utils, or remove cn and use template literals

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
    <div className={cn("glass-panel w-full h-full min-h-[200px]", className)}>
      {/* Header (Only renders if title exists) */}
      {(title || icon || action) && (
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-[hsl(var(--primary))]">
            {icon && <span className="w-4 h-4">{icon}</span>}
            {title && (
              <h3 className="font-bold text-xs uppercase tracking-[0.15em]">
                {title}
              </h3>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Content Area - Grows to fill space */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </div>
    </div>
  );
}
