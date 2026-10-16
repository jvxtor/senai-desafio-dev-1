import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClubDto } from '../../src/clubs/dto/create-club.dto.js';
import { MAX_SQUAD_SIZE } from '../../src/market/market-calculator.js';
import { CreatePlayerDto } from '../../src/players/dto/create-player.dto.js';
import { buildSeedPlan } from './build.js';
import { SEED_CLUBS, SEED_FREE_PLAYERS } from './data.js';

const NOW = new Date('2026-06-01T12:00:00.000Z');
const MAX_LOYALTY_DAYS = 1095;
const DAY = 86_400_000;

function asPlayerDto({
  condition: _condition,
  ...dto
}: (typeof SEED_FREE_PLAYERS)[number]) {
  return plainToInstance(CreatePlayerDto, dto);
}

describe('dados do seed', () => {
  const everyPlayer = [
    ...SEED_CLUBS.flatMap((club) => club.squad),
    ...SEED_FREE_PLAYERS,
  ];

  it('todo jogador passa na mesma validação do POST /players', async () => {
    for (const player of everyPlayer) {
      const errors = await validate(asPlayerDto(player));
      expect(errors, player.name).toEqual([]);
    }
  });

  it('todo clube passa na mesma validação do POST /clubs', async () => {
    for (const club of SEED_CLUBS) {
      const dto = plainToInstance(CreateClubDto, {
        name: club.name,
        acronym: club.acronym,
      });
      expect(await validate(dto), club.name).toEqual([]);
    }
  });

  it('nomes de jogadores e siglas de clubes não se repetem', () => {
    const names = everyPlayer.map((player) => player.name.toLowerCase());
    const acronyms = SEED_CLUBS.map((club) => club.acronym);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(acronyms).size).toBe(acronyms.length);
  });

  it('cobre as três condições e as cinco posições', () => {
    expect(new Set(everyPlayer.map((player) => player.condition))).toEqual(
      new Set(['APTO', 'MAL_CONDICIONADO', 'DOENTE']),
    );
    expect(new Set(everyPlayer.map((player) => player.position))).toEqual(
      new Set(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']),
    );
  });
});

describe('plano do seed', () => {
  const plan = buildSeedPlan(NOW);

  it('nenhum elenco passa do limite de 12 jogadores', () => {
    for (const club of plan.clubs) {
      expect(club.squad.length).toBeLessThanOrEqual(MAX_SQUAD_SIZE);
    }
  });

  it('o caixa final é o caixa inicial menos o custo de cada compra', () => {
    for (const [index, club] of plan.clubs.entries()) {
      const spent = club.squad.reduce(
        (sum, member) => sum - Number(member.purchase.variacaoCaixa),
        0,
      );
      expect(Number(club.caixa)).toBeCloseTo(
        SEED_CLUBS[index].initialCash - spent,
        2,
      );
      expect(Number(club.caixa)).toBeGreaterThan(0);
    }
  });

  it('o histórico de compras é coerente com o valor de mercado e a taxa', () => {
    for (const club of plan.clubs) {
      for (const { purchase } of club.squad) {
        const total = Number(purchase.valorCompra) + Number(purchase.taxa);
        expect(Number(purchase.variacaoCaixa)).toBeCloseTo(-total, 2);
        expect(Number(purchase.taxa)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('a fidelidade respeita o limite de 1.095 dias a partir da compra', () => {
    for (const club of plan.clubs) {
      for (const { purchase } of club.squad) {
        const days =
          (purchase.fidelidadeAte.getTime() - purchase.iniciadoEm.getTime()) /
          DAY;
        expect(days).toBeGreaterThan(0);
        expect(days).toBeLessThanOrEqual(MAX_LOYALTY_DAYS);
      }
    }
  });

  it('as compras de cada clube estão em ordem cronológica', () => {
    for (const club of plan.clubs) {
      const dates = club.squad.map((member) =>
        member.purchase.iniciadoEm.getTime(),
      );
      expect(dates).toEqual([...dates].sort((a, b) => a - b));
    }
  });

  it('só clubes com formação têm titulares, e são exatamente 5', () => {
    for (const club of plan.clubs) {
      const starters = club.squad.filter((member) => member.starter).length;
      expect(starters).toBe(club.formacao === null ? 0 : 5);
    }
  });

  it('inclui clube sem escalação e com caixa baixo para testar recusas', () => {
    const poor = plan.clubs.find((club) => club.formacao === null);

    expect(poor).toBeDefined();
    expect(Number(poor?.caixa)).toBeLessThan(20);
  });

  it('o valor base dos livres é calculado, nunca digitado', () => {
    for (const player of plan.freePlayers) {
      expect(Number(player.valorBase)).toBeGreaterThanOrEqual(1);
    }
  });
});
