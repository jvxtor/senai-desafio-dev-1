import { Decimal } from 'decimal.js';
import type { Jogador } from '../generated/prisma/client.js';
import { calculateMarketValue } from '../players/player-calculator.js';
import type { Condition } from '../players/player.constants.js';

type SquadPlayer = Pick<
  Jogador,
  'valorBase' | 'condicao' | 'agilidade' | 'idade'
>;

export function calculateSquadValue(players: SquadPlayer[]): Decimal {
  return players.reduce(
    (total, player) =>
      total.plus(
        calculateMarketValue(
          player.valorBase,
          player.condicao as Condition,
          player.agilidade,
          player.idade,
        ),
      ),
    new Decimal(0),
  );
}
