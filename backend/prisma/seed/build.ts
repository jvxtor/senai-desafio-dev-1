import { Decimal } from 'decimal.js';
import { roundMoney } from '../../src/common/money.js';
import { fitsFormation, LINEUP_SIZE } from '../../src/lineup/formations.js';
import type { Formation } from '../../src/lineup/formations.js';
import {
  calculatePurchaseFee,
  isWithinCashLimit,
  MILLISECONDS_PER_DAY,
} from '../../src/market/market-calculator.js';
import {
  calculateBaseValue,
  calculateMarketValue,
  calculateOverall,
} from '../../src/players/player-calculator.js';
import type { Condition } from '../../src/players/player.constants.js';
import { SEED_CLUBS, SEED_FREE_PLAYERS } from './data.js';
import type { SeedClub, SeedPlayer } from './data.js';

// Quantos dias atrás cada contratação aconteceu, do elenco mais antigo ao mais recente.
const DAYS_SINCE_PURCHASE = [90, 81, 72, 63, 54, 45, 36, 27];
// Quantos dias faltam para a fidelidade acabar; o negativo é um contrato já vencido.
const LOYALTY_DAYS_LEFT = [540, 300, 150, 25, 700, 90, 400, -5];

export interface PlayerRow {
  nome: string;
  posicao: string;
  agilidade: number;
  idade: number;
  valorBase: string;
  condicao: Condition;
  velocidade: number;
  finalizacao: number;
  passe: number;
  drible: number;
  defesa: number;
  fisico: number;
  potencial: number;
}

export interface PurchaseRow {
  valorCompra: string;
  taxa: string;
  variacaoCaixa: string;
  iniciadoEm: Date;
  fidelidadeAte: Date;
}

export interface PlannedSquadPlayer {
  player: PlayerRow;
  purchase: PurchaseRow;
  starter: boolean;
}

export interface PlannedClub {
  nome: string;
  sigla: string;
  caixa: string;
  formacao: Formation | null;
  squad: PlannedSquadPlayer[];
}

export interface SeedPlan {
  clubs: PlannedClub[];
  freePlayers: PlayerRow[];
}

function toPlayerRow(seed: SeedPlayer): PlayerRow {
  const overall = calculateOverall(seed.position, seed);
  const baseValue = calculateBaseValue(overall, seed.potential, seed.age);

  return {
    nome: seed.name,
    posicao: seed.position,
    agilidade: seed.agility,
    idade: seed.age,
    valorBase: baseValue.toFixed(2),
    condicao: seed.condition,
    velocidade: seed.pace,
    finalizacao: seed.shooting,
    passe: seed.passing,
    drible: seed.dribbling,
    defesa: seed.defending,
    fisico: seed.physical,
    potencial: seed.potential,
  };
}

function daysFrom(now: Date, days: number): Date {
  return new Date(now.getTime() + days * MILLISECONDS_PER_DAY);
}

function assertLineup(club: SeedClub): void {
  if (club.formation === null) {
    if (club.starters.length > 0) {
      throw new Error(`${club.name}: titulares sem formação.`);
    }
    return;
  }

  const starters = club.starters.map((name) => {
    const found = club.squad.find((candidate) => candidate.name === name);
    if (!found)
      throw new Error(`${club.name}: titular ${name} fora do elenco.`);
    return found;
  });

  if (starters.length !== LINEUP_SIZE) {
    throw new Error(
      `${club.name}: a escalação precisa de ${LINEUP_SIZE} titulares.`,
    );
  }
  if (starters.some((starter) => starter.condition === 'DOENTE')) {
    throw new Error(`${club.name}: jogador DOENTE não pode ser titular.`);
  }
  if (
    !fitsFormation(
      starters.map((starter) => starter.position),
      club.formation,
    )
  ) {
    throw new Error(
      `${club.name}: os titulares não fecham a formação ${club.formation}.`,
    );
  }
}

// Repete as regras da compra (valor de mercado, taxa e limite de 50% do caixa) com as
// mesmas funções do MarketService, para o histórico do seed nunca contradizer a API.
function planClub(club: SeedClub, now: Date): PlannedClub {
  assertLineup(club);

  let cash = new Decimal(club.initialCash);
  const squad = club.squad.map((seed, index) => {
    const player = toPlayerRow(seed);
    const value = calculateMarketValue(
      player.valorBase,
      player.condicao,
      player.agilidade,
      player.idade,
    );
    const fee = calculatePurchaseFee(value);
    const totalCost = roundMoney(value.plus(fee));

    if (!isWithinCashLimit(totalCost, cash)) {
      throw new Error(
        `${club.name}: a compra de ${seed.name} (${totalCost.toFixed(2)}) passa de 50% do caixa (${cash.toFixed(2)}).`,
      );
    }
    cash = cash.minus(totalCost);

    return {
      player,
      starter: club.starters.includes(seed.name),
      purchase: {
        valorCompra: value.toFixed(2),
        taxa: fee.toFixed(2),
        variacaoCaixa: totalCost.negated().toFixed(2),
        iniciadoEm: daysFrom(now, -DAYS_SINCE_PURCHASE[index]),
        fidelidadeAte: daysFrom(now, LOYALTY_DAYS_LEFT[index]),
      },
    };
  });

  return {
    nome: club.name,
    sigla: club.acronym,
    caixa: cash.toFixed(2),
    formacao: club.formation,
    squad,
  };
}

export function buildSeedPlan(now: Date = new Date()): SeedPlan {
  return {
    clubs: SEED_CLUBS.map((club) => planClub(club, now)),
    freePlayers: SEED_FREE_PLAYERS.map(toPlayerRow),
  };
}
