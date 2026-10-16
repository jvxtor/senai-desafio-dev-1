import { ChartNoAxesColumn } from 'lucide-react';
import type { PlayerFormValues } from './validation';

interface AttributePreviewProps {
  values: PlayerFormValues;
}

type Attribute = keyof Pick<
  PlayerFormValues,
  'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical'
>;

const ATTRIBUTES: { field: Attribute; label: string }[] = [
  { field: 'pace', label: 'Velocidade' },
  { field: 'shooting', label: 'Finalização' },
  { field: 'passing', label: 'Passe' },
  { field: 'dribbling', label: 'Drible' },
  { field: 'defending', label: 'Defesa' },
  { field: 'physical', label: 'Físico' },
];

const MAX_ATTRIBUTE = 99;

// Só desenha o que está digitado: um valor que ainda não é um inteiro de 1 a 99 fica vazio.
function toScore(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;

  const value = Number(trimmed);
  const valid = Number.isInteger(value) && value >= 1 && value <= MAX_ATTRIBUTE;
  return valid ? value : null;
}

const toPercent = (score: number | null) => `${((score ?? 0) / MAX_ATTRIBUTE) * 100}%`;

export function AttributePreview({ values }: AttributePreviewProps) {
  const potential = toScore(values.potential);

  return (
    <aside
      aria-label="Prévia dos atributos"
      className="flex h-full flex-col gap-3 rounded-xl border bg-background p-4"
    >
      <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <ChartNoAxesColumn aria-hidden="true" className="size-4" />
        Prévia dos atributos
      </h3>

      <ul className="flex flex-col gap-2.5">
        {ATTRIBUTES.map(({ field, label }) => {
          const score = toScore(values[field]);

          return (
            <li key={field} className="grid grid-cols-[5.5rem_1fr_1.75rem] items-center gap-2">
              <span className="text-sm">{label}</span>
              <span aria-hidden="true" className="relative h-2 rounded-full">
                <span
                  data-slot="potential-range"
                  className="absolute inset-y-0 left-0 rounded-full bg-primary/20"
                  style={{ width: toPercent(potential) }}
                />
                <span
                  data-slot="attribute-fill"
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  style={{ width: toPercent(score) }}
                />
              </span>
              <span className="text-right text-sm font-semibold tabular-nums">{score ?? '–'}</span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        {potential === null
          ? 'Preencha o potencial para ver a faixa clara. '
          : `Faixa clara: até o potencial (${potential}). `}
        A prévia só desenha os valores digitados; não calcula overall nem valor base.
      </p>
    </aside>
  );
}
