import type { Formation } from '../../src/lineup/formations.js';
import type {
  Attributes,
  Condition,
  Position,
} from '../../src/players/player.constants.js';

export interface SeedPlayer extends Attributes {
  name: string;
  position: Position;
  age: number;
  agility: number;
  potential: number;
  condition: Condition;
}

export interface SeedClub {
  name: string;
  acronym: string;
  /** Caixa antes das compras; o caixa final é este valor menos o que o elenco custou. */
  initialCash: number;
  formation: Formation | null;
  /** Elenco na ordem em que foi contratado: do mais antigo ao mais recente. */
  squad: SeedPlayer[];
  /** Nomes dos titulares; precisam fechar a formação e não podem estar doentes. */
  starters: string[];
}

type Stats = [
  pace: number,
  shooting: number,
  passing: number,
  dribbling: number,
  defending: number,
  physical: number,
];

function player(
  name: string,
  position: Position,
  age: number,
  agility: number,
  stats: Stats,
  potential: number,
  condition: Condition = 'APTO',
): SeedPlayer {
  const [pace, shooting, passing, dribbling, defending, physical] = stats;
  return {
    name,
    position,
    age,
    agility,
    pace,
    shooting,
    passing,
    dribbling,
    defending,
    physical,
    potential,
    condition,
  };
}

export const SEED_CLUBS: SeedClub[] = [
  {
    name: 'Águias FC',
    acronym: 'AGU',
    initialCash: 400,
    formation: '2-1-1',
    squad: [
      player('Rafael Moura', 'GOL', 29, 55, [40, 10, 62, 30, 78, 74], 78),
      player('Caio Brandão', 'ZAG', 27, 48, [52, 25, 58, 38, 76, 80], 80),
      player('Otávio Lessa', 'ZAG', 31, 42, [45, 22, 55, 35, 72, 78], 78),
      player('Léo Santana', 'LAT', 24, 78, [80, 40, 66, 70, 62, 60], 84),
      player('Thiago Ribeiro', 'MEI', 26, 70, [66, 62, 82, 80, 45, 64], 83),
      player(
        'Mateus Aragão',
        'MEI',
        33,
        52,
        [50, 58, 78, 70, 50, 60],
        78,
        'MAL_CONDICIONADO',
      ),
      player('Bruno Falcão', 'ATA', 22, 82, [84, 80, 60, 76, 30, 66], 88),
      player('Davi Nogueira', 'ATA', 19, 74, [76, 70, 50, 72, 25, 58], 90),
    ],
    starters: [
      'Rafael Moura',
      'Caio Brandão',
      'Otávio Lessa',
      'Thiago Ribeiro',
      'Bruno Falcão',
    ],
  },
  {
    name: 'Mangue FC',
    acronym: 'MAN',
    initialCash: 450,
    formation: '2-2',
    squad: [
      player('Henrique Dantas', 'GOL', 34, 50, [38, 8, 60, 28, 80, 76], 80),
      player('Gabriel Cavalcanti', 'ZAG', 30, 45, [48, 20, 52, 32, 79, 82], 82),
      player('Renan Teixeira', 'LAT', 25, 80, [82, 38, 64, 68, 66, 62], 82),
      player('Vinícius Paes', 'LAT', 21, 76, [78, 35, 60, 66, 58, 56], 85),
      player('Eduardo Farias', 'MEI', 28, 62, [60, 55, 76, 74, 48, 62], 78),
      player('Samuel Barreto', 'ATA', 27, 77, [78, 79, 58, 74, 28, 64], 80),
      player('Wesley Azevedo', 'ATA', 23, 68, [70, 74, 52, 68, 26, 60], 80),
      player(
        'Fábio Cordeiro',
        'MEI',
        36,
        40,
        [40, 50, 72, 60, 46, 52],
        72,
        'DOENTE',
      ),
    ],
    starters: [
      'Henrique Dantas',
      'Gabriel Cavalcanti',
      'Renan Teixeira',
      'Samuel Barreto',
      'Wesley Azevedo',
    ],
  },
  {
    name: 'Delta FC',
    acronym: 'DEL',
    initialCash: 500,
    formation: '1-2-1',
    squad: [
      player('Igor Vasconcelos', 'GOL', 26, 58, [44, 10, 58, 30, 76, 72], 80),
      player('Marcelo Pinheiro', 'ZAG', 29, 44, [46, 22, 54, 34, 77, 80], 80),
      player('Nelson Batista', 'ZAG', 38, 35, [35, 18, 50, 28, 70, 66], 70),
      player('Anderson Peixoto', 'LAT', 23, 79, [81, 36, 62, 69, 60, 58], 83),
      player('Ricardo Salles', 'MEI', 25, 72, [64, 60, 80, 78, 46, 62], 82),
      player('Paulo Henrique', 'MEI', 30, 66, [58, 56, 76, 72, 50, 64], 78),
      player('Diego Mendonça', 'ATA', 28, 75, [76, 77, 56, 72, 27, 66], 79),
      player(
        'Lucas Valadares',
        'ATA',
        20,
        81,
        [83, 72, 52, 74, 24, 56],
        86,
        'MAL_CONDICIONADO',
      ),
    ],
    starters: [
      'Igor Vasconcelos',
      'Marcelo Pinheiro',
      'Ricardo Salles',
      'Paulo Henrique',
      'Diego Mendonça',
    ],
  },
  {
    // Elenco curto e caixa baixo: serve para testar a compra recusada por falta de caixa
    // e a escalação incompleta.
    name: 'Leões do Sul',
    acronym: 'LEO',
    initialCash: 40,
    formation: null,
    squad: [
      player('Alan Ferraz', 'GOL', 32, 46, [36, 8, 50, 26, 64, 62], 66),
      player('Cleber Duarte', 'ZAG', 35, 40, [38, 18, 46, 30, 60, 62], 62),
      player('Jonas Pacheco', 'ATA', 31, 60, [62, 64, 44, 58, 22, 56], 66),
    ],
    starters: [],
  },
];

// Jogadores livres para comprar: de baratos a caros, de jovens promessas a veteranos,
// nas três condições e com nomes acentuados para exercitar a busca.
export const SEED_FREE_PLAYERS: SeedPlayer[] = [
  player('João Pedro Lima', 'MEI', 24, 74, [68, 60, 80, 82, 40, 60], 86),
  player('Ênio Carvalho', 'GOL', 28, 52, [42, 8, 60, 30, 74, 70], 75),
  player(
    'Álvaro Siqueira',
    'ZAG',
    26,
    50,
    [50, 22, 56, 34, 74, 78],
    78,
    'DOENTE',
  ),
  player('Matheus Guedes', 'LAT', 18, 84, [86, 38, 62, 70, 50, 52], 92),
  player('Kauê Tavares', 'ATA', 17, 90, [88, 76, 48, 78, 20, 50], 94),
  player(
    'Sérgio Lacerda',
    'ATA',
    37,
    38,
    [44, 82, 60, 64, 24, 60],
    82,
    'MAL_CONDICIONADO',
  ),
  player('Murilo Fontes', 'MEI', 29, 64, [60, 58, 74, 72, 48, 64], 76),
  player('Bernardo Queiroz', 'ATA', 25, 83, [86, 88, 62, 82, 30, 70], 90),
  player('Tiago Amorim', 'ZAG', 22, 55, [56, 24, 56, 36, 72, 76], 82),
  player(
    'Wagner Luz',
    'GOL',
    30,
    48,
    [38, 8, 54, 28, 70, 68],
    72,
    'MAL_CONDICIONADO',
  ),
];
