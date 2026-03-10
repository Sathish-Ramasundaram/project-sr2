import React, { ReactNode } from "react";

type AppHeaderProps = {
  left: ReactNode;
  right?: ReactNode;
};

function AppHeader({ left, right }: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-slate-300 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
      <div className="flex h-full w-full items-center justify-between px-6">
        {left}
        {right ? right : <div />}
      </div>
    </header>
  );
}

export default AppHeader;
