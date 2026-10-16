import { Check, CircleCheck, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FormError } from '../../components/forms/fields';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { useSetLineup } from '../../hooks/lineup';
import { getErrorMessage } from '../../lib/errors';
import { cn } from '../../lib/utils';
import type { Formation, Lineup, SquadPlayer } from '../../services/types';
import { CONDITION_LABELS, CONDITION_STYLE } from '../players/labels';
import { FormationPicker } from './FormationPicker';
import { LineupPitch } from './LineupPitch';
import { LineupReserves } from './LineupReserves';
import {
  LINEUP_SIZE,
  SECTOR_POSITIONS,
  TIRED_DISCOUNT_PERCENT,
  prefillPicks,
  slotsOf,
  usedAttributes,
} from './lineup';

interface LineupEditorProps {
  clubId: number;
  squad: SquadPlayer[];
  /** A escalação salva: de onde o formulário parte e para onde o Cancelar volta. */
  saved: Lineup;
}

const HEADERS = ['Vaga', 'Titular', 'Condição', 'Overall', 'Atributos usados'] as const;
const CELL = 'px-3 py-3';

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`;
}

// A escalação editada direto na aba: formação, um titular por vaga, o campo e os reservas.
export function LineupEditor({ clubId, squad, saved }: LineupEditorProps) {
  const save = useSetLineup();
  const byId = useMemo(() => new Map(squad.map((player) => [String(player.id), player])), [squad]);

  const [formation, setFormation] = useState<Formation | ''>(saved.formation ?? '');
  const [picks, setPicks] = useState<string[]>(() =>
    saved.formation ? prefillPicks(saved.formation, saved.players) : [],
  );
  const [missing, setMissing] = useState<boolean[]>([]);

  const slots = formation ? slotsOf(formation) : [];
  const picked = slots.map((_, index) => byId.get(picks[index] ?? ''));
  const chosen = picked.filter((player): player is SquadPlayer => player !== undefined);
  const attributes = usedAttributes(chosen);
  const tired = chosen.filter((player) => player.condition === 'MAL_CONDICIONADO');
  const reserves = squad.filter((player) => !picks.includes(String(player.id)));
  const apiError = save.error ? getErrorMessage(save.error) : null;
  const savedComplete = saved.players.length === LINEUP_SIZE;

  // Trocar a formação leva os titulares já escolhidos para as vagas que servem para eles.
  function changeFormation(next: Formation) {
    setFormation(next);
    setPicks(prefillPicks(next, chosen));
    setMissing([]);
    save.reset();
  }

  function changePick(index: number, value: string) {
    setPicks((current) =>
      slots.map((_, position) => (position === index ? value : (current[position] ?? ''))),
    );
    setMissing((current) =>
      current.map((isMissing, position) => (position === index ? false : isMissing)),
    );
  }

  function cancel() {
    setFormation(saved.formation ?? '');
    setPicks(saved.formation ? prefillPicks(saved.formation, saved.players) : []);
    setMissing([]);
    save.reset();
  }

  // Doente não joga, e o mesmo jogador não ocupa duas vagas.
  function optionsFor(index: number) {
    const allowed = SECTOR_POSITIONS[slots[index].sector];
    const takenElsewhere = new Set(picks.filter((_, position) => position !== index));

    return squad
      .filter(
        (player) =>
          allowed.includes(player.position) &&
          player.condition !== 'DOENTE' &&
          !takenElsewhere.has(String(player.id)),
      )
      .map((player) => ({
        value: String(player.id),
        label: `${player.name} (${player.position})`,
      }));
  }

  function handleSave() {
    if (!formation) {
      setMissing([]);
      toast.error('Escolha a formação.');
      return;
    }

    const empty = slots.map((_, index) => !picks[index]);
    setMissing(empty);
    if (empty.some(Boolean)) return;

    save.mutate(
      { clubId, input: { formation, player_ids: picks.map(Number) } },
      { onSuccess: () => toast.success('Escalação salva.') },
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <section aria-label="Titulares" className="flex flex-col rounded-xl border bg-background">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-3">
          <div>
            <h3 className="text-base font-semibold">Titulares</h3>
            <p className="text-xs text-muted-foreground">
              1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.
            </p>
          </div>
          {savedComplete ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <CircleCheck aria-hidden="true" className="size-3.5" />
              Completa
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              Incompleta · {saved.players.length} de {LINEUP_SIZE}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t px-4 py-4">
          <div>
            <h4 className="text-sm font-semibold">Formação</h4>
            <p className="text-xs text-muted-foreground">
              Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da
              conta.
            </p>
          </div>
          <FormationPicker value={formation} onChange={changeFormation} />
        </div>

        <div className="border-t">
          {formation === '' ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Escolha uma formação para ver as vagas.
            </p>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  {HEADERS.map((header) => (
                    <TableHead
                      key={header}
                      className={cn(
                        CELL,
                        'h-auto text-sm font-normal text-muted-foreground',
                        header === 'Overall' && 'text-right',
                      )}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot, index) => {
                  const player = picked[index];
                  const used = player ? attributes.get(player.id) : undefined;

                  return (
                    <TableRow key={`${formation}-${index}`}>
                      <TableCell className={CELL}>
                        <p className="font-medium">{slot.label}</p>
                        <p className="text-xs text-muted-foreground">{slot.hint}</p>
                      </TableCell>
                      <TableCell className={cn(CELL, 'min-w-52')}>
                        <Select
                          value={picks[index] ?? ''}
                          items={[{ value: '', label: 'Escolha o titular' }, ...optionsFor(index)]}
                          onValueChange={(next) => changePick(index, next ?? '')}
                        >
                          <SelectTrigger
                            aria-label={`Titular da vaga ${slot.ariaLabel}`}
                            aria-invalid={missing[index] ? true : undefined}
                            className={cn(
                              'h-9 w-full data-[size=default]:h-9',
                              !player && 'text-muted-foreground',
                            )}
                          >
                            <span className="truncate">
                              {player ? `${player.name} (${player.position})` : 'Escolha o titular'}
                            </span>
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false} align="start">
                            <SelectItem value="">Escolha o titular</SelectItem>
                            {optionsFor(index).map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {missing[index] && (
                          <p role="alert" className="mt-1 text-xs text-destructive">
                            Escolha o titular desta vaga.
                          </p>
                        )}
                      </TableCell>
                      <TableCell className={CELL}>
                        {player ? (
                          <Badge variant="outline" className={CONDITION_STYLE[player.condition]}>
                            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                            {CONDITION_LABELS[player.condition]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell className={cn(CELL, 'text-right font-semibold tabular-nums')}>
                        {player ? player.overall : '–'}
                      </TableCell>
                      <TableCell className={cn(CELL, 'text-sm')}>
                        {used ? (
                          <span className="flex flex-wrap gap-x-3">
                            {used.map((attribute) => (
                              <span key={attribute.label}>
                                <span className="text-muted-foreground">{attribute.label}</span>{' '}
                                <span className="font-semibold tabular-nums">
                                  {attribute.value}
                                </span>
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {(tired.length > 0 || apiError) && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {tired.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <TriangleAlert aria-hidden="true" />
                <AlertTitle>
                  {joinNames(tired.map((player) => player.name))}{' '}
                  {tired.length === 1 ? 'está mal condicionado' : 'estão mal condicionados'}
                </AlertTitle>
                <AlertDescription className="text-amber-800">
                  {tired.length === 1 ? 'Pode jogar' : 'Podem jogar'}, mas cada atributo vale{' '}
                  {TIRED_DISCOUNT_PERCENT}% a menos durante a partida.
                </AlertDescription>
              </Alert>
            )}
            {apiError && <FormError message={apiError} />}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4">
          <p className="max-w-md text-xs text-muted-foreground">
            A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube
            só volta a jogar depois de escalar de novo.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={save.isPending} onClick={cancel}>
              Cancelar
            </Button>
            <Button type="button" disabled={save.isPending} onClick={handleSave}>
              <Check aria-hidden="true" />
              Salvar escalação
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <LineupPitch formation={formation} picks={picked} />
        <LineupReserves players={reserves} />
      </div>
    </div>
  );
}
