// Marcações de campo desenhadas só com bordas, para servir de fundo da página inicial.
export function PitchMarkings() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
      <div className="absolute top-[46%] left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border" />

      <Penalty side="left" />
      <Penalty side="right" />
    </div>
  );
}

function Penalty({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  const edge = isLeft ? 'left-0 border-r' : 'right-0 border-l';
  const arc = isLeft ? '-right-24' : '-left-24';

  return (
    <div
      className={`absolute top-[46%] h-72 w-44 -translate-y-1/2 border-y ${edge}`}
    >
      <div
        className={`absolute top-1/2 size-48 -translate-y-1/2 rounded-full border ${arc}`}
      />
      <div
        className={`absolute top-1/2 h-32 w-20 -translate-y-1/2 border-y bg-background ${edge}`}
      />
    </div>
  );
}
