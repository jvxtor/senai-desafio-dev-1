import type { Params } from 'react-router';
import { useMatch } from '../../hooks/matches';

// O último trecho da trilha na tela de uma partida: "Delta FC 2 × 1 Águias FC".
export function MatchCrumb({ params }: { params: Params }) {
  const { data } = useMatch(Number(params.id));

  return (
    <>
      {data
        ? `${data.home.club_name} ${data.home.goals} × ${data.away.goals} ${data.away.club_name}`
        : 'Partida'}
    </>
  );
}
