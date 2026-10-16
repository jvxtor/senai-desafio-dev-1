import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Ação principal da página, como o botão de cadastro. */
  action?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, action }: PageHeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-xl border bg-background text-primary"
        >
          <Icon className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground short:hidden">{description}</p>
        </div>
      </div>
      {action}
    </header>
  );
}
