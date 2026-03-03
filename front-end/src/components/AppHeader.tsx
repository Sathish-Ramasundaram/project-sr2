import React, { ReactNode } from "react";

type AppHeaderProps = {
  left: ReactNode;
  right?: ReactNode;
  containerClassName?: string;
  compact?: boolean;
};

function AppHeader({ left, right, containerClassName = "w-full", compact = true }: AppHeaderProps) {
  const verticalPaddingClass = compact ? "py-2" : "py-4";

  return (
    <header className="border-b border-slate-300 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
      <div className={`flex items-center justify-between px-6 ${verticalPaddingClass} ${containerClassName}`}>
        {left}
        {right ? right : <div />}
      </div>
    </header>
  );
}

export default AppHeader;
