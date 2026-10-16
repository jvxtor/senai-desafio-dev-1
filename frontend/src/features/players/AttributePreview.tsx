import { ChartNoAxesColumn } from 'lucide-react';
import { AttributeBars, MAX_ATTRIBUTE, type AttributeKey } from './AttributeBars';
import type { PlayerFormValues } from './validation';

interface AttributePreviewProps {
  values: PlayerFormValues;
}

const KEYS: AttributeKey[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];

// Só desenha o que está digitado: um valor que ainda não é um inteiro de 1 a 99 fica vazio.
function toScore(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;

  const value = Number(trimmed);
  const valid = Number.isInteger(value) && value >= 1 && value <= MAX_ATTRIBUTE;
  return valid ? value : null;
}

export function AttributePreview({ values }: AttributePreviewProps) {
  const potential = toScore(values.potential);
  const scores = Object.fromEntries(KEYS.map((key) => [key, toScore(values[key])])) as Record<
    AttributeKey,
    number | null
  >;

  return (
    <aside
      aria-label="Prévia dos atributos"
      className="flex h-full flex-col gap-3 rounded-xl border bg-background p-4"
    >
      <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <ChartNoAxesColumn aria-hidden="true" className="size-4" />
        Prévia dos atributos
      </h3>

      <AttributeBars scores={scores} potential={potential} />

      <p className="text-xs text-muted-foreground">
        {potential === null
          ? 'Preencha o potencial para ver a faixa clara. '
          : `Faixa clara: até o potencial (${potential}). `}
        A prévia só desenha os valores digitados; não calcula overall nem valor base.
      </p>
    </aside>
  );
}
