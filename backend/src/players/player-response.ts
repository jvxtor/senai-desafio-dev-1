import type { Jogador } from '../generated/prisma/client.js';
import { calculateMarketValue, calculateOverall } from './player-calculator.js';
import type { Condition, Position } from './player.constants.js';

export interface PlayerResponse {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export function toPlayerResponse(player: Jogador): PlayerResponse {
  const position = player.posicao as Position;
  const condition = player.condicao as Condition;
  const attributes = {
    pace: player.velocidade,
    shooting: player.finalizacao,
    passing: player.passe,
    dribbling: player.drible,
    defending: player.defesa,
    physical: player.fisico,
  };

  return {
    id: player.id,
    name: player.nome,
    position,
    agility: player.agilidade,
    age: player.idade,
    condition,
    base_value: player.valorBase.toNumber(),
    market_value: calculateMarketValue(
      player.valorBase,
      condition,
      player.agilidade,
      player.idade,
    ).toNumber(),
    ...attributes,
    potential: player.potencial,
    overall: calculateOverall(position, attributes),
    club_id: player.clubeId,
  };
}
