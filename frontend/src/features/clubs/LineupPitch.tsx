import { HeartPulse, Swords } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Formation, SquadPlayer } from '../../services/types';
import { initialsOf } from '../players/labels';
import { SECTORS_TOP_DOWN, compareSquad, slotsOf, type Sector } from './lineup';

interface LineupPitchProps {
  formation: Formation | '';
  /** Um por vaga, na ordem de slotsOf; vaga sem titular fica vazia. */
  picks: (SquadPlayer | undefined)[];
}

// Altura de cada fileira no campo, do ataque ao goleiro, conforme quantas fileiras há.
const ROW_Y: Record<number, number[]> = {
  3: [16, 56, 86],
  4: [14, 36, 60, 86],
};

const STRIPES: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 8.33%, transparent 8.33% 16.66%)',
};

function lastName(name: string): string {
  return name.split(' ').filter(Boolean).at(-1) ?? name;
}

function Disc({ player, x, y }: { player: SquadPlayer | undefined; x: number; y: number }) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {player ? (
        <>
          <span className="relative grid size-9 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white ring-2 ring-white/70">
            {initialsOf(player.name)}
            {player.condition === 'MAL_CONDICIONADO' && (
              <span
                title="Mal condicionado"
                className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-orange-500 text-white ring-1 ring-white"
              >
                <HeartPulse aria-hidden="true" className="size-2.5" />
              </span>
            )}
          </span>
          <span className="rounded-full bg-white/90 px-2 py-px text-[0.65rem] font-medium text-foreground">
            {lastName(player.name)}
          </span>
        </>
      ) : (
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full border-2 border-dashed border-white/60 text-xs text-white/70"
        >
          ?
        </span>
      )}
    </div>
  );
}

// "Em campo": a formação escolhida vista de cima, do goleiro (embaixo) ao ataque (no alto).
export function LineupPitch({ formation, picks }: LineupPitchProps) {
  const slots = formation ? slotsOf(formation) : [];

  const rows = SECTORS_TOP_DOWN.map((sector: Sector) => ({
    sector,
    members: slots
      .map((slot, index) => ({ slot, player: picks[index] }))
      .filter((member) => member.slot.sector === sector)
      // Dentro do setor, a ordem do elenco: ZAG antes de LAT, e assim por diante.
      .sort((a, b) =>
        a.player && b.player ? compareSquad(a.player, b.player) : a.player ? -1 : b.player ? 1 : 0,
      ),
  })).filter((row) => row.members.length > 0);

  const heights = ROW_Y[rows.length] ?? [];

  return (
    <section
      aria-label="Em campo"
      className="flex flex-col gap-3 rounded-xl border bg-background p-4"
    >
      <div>
        <h3 className="text-base font-semibold">Em campo</h3>
        <p className="text-xs text-muted-foreground">
          {formation
            ? `Prévia da formação ${formation}, do goleiro ao ataque.`
            : 'Escolha uma formação para ver o campo.'}
        </p>
      </div>

      <div
        data-slot="pitch"
        className="relative aspect-[205/262] w-full overflow-hidden rounded-lg bg-emerald-800"
        style={STRIPES}
      >
        <div aria-hidden="true" className="absolute inset-2 rounded-sm border border-white/50" />
        <div
          aria-hidden="true"
          className="absolute top-[30%] left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
        />
        <div
          aria-hidden="true"
          className="absolute right-[26%] bottom-2 left-[26%] h-[17%] border border-white/50"
        />
        {rows.map((row, rowIndex) =>
          row.members.map((member, index) => (
            <Disc
              key={`${row.sector}-${index}`}
              player={member.player}
              x={((index + 1) / (row.members.length + 1)) * 100}
              y={heights[rowIndex]}
            />
          )),
        )}
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
        <Swords aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2 mais
          recuados. É gol quando o ataque é maior que a defesa.
        </span>
      </p>
    </section>
  );
}
