import { Clock, Shield, Swords, Trophy, Users, type LucideIcon } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router';

interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Sem rota, o item aparece desativado até a tela existir. */
  to?: string;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Mercado',
    items: [
      { label: 'Jogadores', icon: Users, to: '/jogadores' },
      { label: 'Clubes', icon: Shield },
    ],
  },
  {
    title: 'Liga',
    items: [
      { label: 'Partidas', icon: Swords },
      { label: 'Classificação', icon: Trophy },
    ],
  },
];

const ITEM_CLASS = 'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap';

function NavEntry({ item }: { item: NavItem }) {
  const Icon = item.icon;

  if (!item.to) {
    return (
      <span
        aria-disabled="true"
        title="Disponível em breve"
        className={`${ITEM_CLASS} cursor-not-allowed text-muted-foreground/50`}
      >
        <Icon aria-hidden="true" className="size-4" />
        {item.label}
      </span>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `${ITEM_CLASS} outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
          isActive
            ? 'bg-muted font-medium text-foreground'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        }`
      }
    >
      <Icon aria-hidden="true" className="size-4" />
      {item.label}
    </NavLink>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-lg bg-primary text-base font-bold text-primary-foreground"
      >
        P
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Passe</span>
        <span className="block text-xs text-muted-foreground">Gestão da liga</span>
      </span>
    </Link>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-svh bg-muted/40 lg:flex">
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r bg-background p-4 lg:sticky lg:top-0 lg:flex lg:h-svh">
        <Brand />
        <nav aria-label="Principal" className="flex flex-col gap-5">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <p className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavEntry key={item.label} item={item} />
              ))}
            </div>
          ))}
        </nav>
        <p className="mt-auto flex items-center gap-2 px-2.5 text-xs text-muted-foreground">
          <Clock aria-hidden="true" className="size-3.5" />
          Horário de Brasília (UTC−3)
        </p>
      </aside>

      <header className="flex flex-col gap-2 border-b bg-background px-4 py-3 lg:hidden">
        <Brand />
        <nav aria-label="Principal" className="flex gap-1 overflow-x-auto">
          {SECTIONS.flatMap((section) => section.items).map((item) => (
            <NavEntry key={item.label} item={item} />
          ))}
        </nav>
      </header>

      <main className="min-w-0 flex-1 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
