import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div
      className={`min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default PageShell;
