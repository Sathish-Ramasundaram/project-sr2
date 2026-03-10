import type { ReactNode } from "react";

type PageMainProps = {
  children: ReactNode;
  className?: string;
};

function PageMain({ children, className = "" }: PageMainProps) {
  return (
    <main className={`min-h-[calc(100vh-56px)] w-full px-6 py-8 ${className}`.trim()}>
      {children}
    </main>
  );
}

export default PageMain;
