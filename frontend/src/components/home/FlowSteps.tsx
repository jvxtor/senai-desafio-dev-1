import {
  ArrowLeftRight,
  ChevronRight,
  History,
  Shield,
  ShoppingCart,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: LucideIcon;
}

// A ordem é a do sistema: cada etapa depende da anterior.
const STEPS: Step[] = [
  {
    title: 'Jogadores',
    description: 'Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.',
    icon: Users,
  },
  {
    title: 'Clubes',
    description: 'Começam com 300,00 em caixa e sem jogadores.',
    icon: Shield,
  },
  {
    title: 'Compra',
    description: 'Valor + taxa, até 50% do caixa, com contrato de fidelidade.',
    icon: ShoppingCart,
  },
  {
    title: 'Venda',
    description: 'Multa antes do fim da fidelidade e comissão sobre o lucro.',
    icon: ArrowLeftRight,
  },
  {
    title: 'Histórico',
    description: 'Toda compra e venda fica registrada, com totais e CSV.',
    icon: History,
  },
  {
    title: 'Liga',
    description: 'Escale 5 titulares e jogue partidas que entram na classificação.',
    icon: Trophy,
  },
];

export function FlowSteps() {
  return (
    <ol className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:flex lg:gap-0">
      {STEPS.map((step, index) => (
        <li key={step.title} className="flex items-center lg:flex-1">
          <article className="h-full flex-1 rounded-xl border bg-background p-4 text-left short:p-3">
            <header className="flex items-center justify-between">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <step.icon aria-hidden="true" className="size-4" />
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
            </header>
            <h2 className="mt-4 text-sm font-semibold short:mt-2">{step.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground short:sr-only">
              {step.description}
            </p>
          </article>
          {index < STEPS.length - 1 && (
            <ChevronRight
              aria-hidden="true"
              className="mx-1 hidden size-3.5 shrink-0 text-muted-foreground lg:block"
            />
          )}
        </li>
      ))}
    </ol>
  );
}
