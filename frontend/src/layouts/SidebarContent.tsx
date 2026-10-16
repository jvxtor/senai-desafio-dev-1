import { ListOrdered, Shield, Swords, Users, type LucideIcon } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { ClubsNav } from './ClubsNav';
import { SidebarSummary } from './SidebarSummary';
import type { NavCounts } from './useNavCounts';

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
  /** Qual contador mostrar ao lado do nome. */
  count?: keyof NavCounts;
  /** O item continua ativo nas telas de dentro dele (a partida aberta, por exemplo). */
  nested?: boolean;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Mercado',
    items: [
      { label: 'Jogadores', icon: Users, to: '/jogadores', count: 'players' },
      { label: 'Clubes', icon: Shield, to: '/clubes', count: 'clubs' },
    ],
  },
  {
    title: 'Liga',
    items: [
      { label: 'Partidas', icon: Swords, to: '/partidas', count: 'matches', nested: true },
      { label: 'Classificação', icon: ListOrdered, to: '/classificacao' },
    ],
  },
];

const ITEM_CLASS = 'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap';

// O número ao lado do nome, quando já chegou.
function Count({ value }: { value: number | undefined }) {
  if (value === undefined) return null;
  return <span className="ml-auto pl-2 text-xs text-muted-foreground tabular-nums">{value}</span>;
}

function NavEntry({ item, counts }: { item: NavItem; counts: NavCounts }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={!item.nested}
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
      <Count value={item.count ? counts[item.count] : undefined} />
    </NavLink>
  );
}

export function Brand() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
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

// O conteúdo da barra lateral: o mesmo na barra fixa do computador e no painel do celular.
export function SidebarContent({ counts }: { counts: NavCounts }) {
  return (
    <>
      <Brand />
      <nav aria-label="Principal" className="flex flex-col gap-5">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <p className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">{section.title}</p>
            {section.items.map((item) => (
              <NavEntry key={item.label} item={item} counts={counts} />
            ))}
          </div>
        ))}
      </nav>
      <ClubsNav />
      <SidebarSummary counts={counts} />
    </>
  );
}
