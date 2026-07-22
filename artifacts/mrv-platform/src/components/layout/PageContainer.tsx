import { ReactNode } from "react";

export function PageContainer({ title, description, action, children }: { title: string, description?: string, action?: ReactNode, children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8 w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1 font-mono">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}