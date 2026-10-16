export type AttributeKey = 'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical';

export const MAX_ATTRIBUTE = 99;

const ATTRIBUTES: { key: AttributeKey; label: string }[] = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalização' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defending', label: 'Defesa' },
  { key: 'physical', label: 'Físico' },
];

interface AttributeBarsProps {
  /** Um atributo sem valor (null) aparece vazio, como "–". */
  scores: Record<AttributeKey, number | null>;
  /** A faixa clara das barras vai até o potencial; sem ele, não há faixa. */
  potential: number | null;
}

const toPercent = (score: number | null) => `${((score ?? 0) / MAX_ATTRIBUTE) * 100}%`;

// Barras dos seis atributos: a faixa escura é o valor e a clara vai até o potencial.
export function AttributeBars({ scores, potential }: AttributeBarsProps) {
  return (
    <ul className="flex flex-col gap-2.5">
      {ATTRIBUTES.map(({ key, label }) => {
        const score = scores[key];

        return (
          <li key={key} className="grid grid-cols-[5.5rem_1fr_1.75rem] items-center gap-2">
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
  );
}
