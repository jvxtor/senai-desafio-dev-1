import { cn } from '../../lib/utils';
import type { Position } from '../../services/types';
import { initialsOf, positionTone } from './labels';

const SIZE = {
  sm: 'size-7 text-[0.7rem]',
  md: 'size-8 text-xs',
  lg: 'size-9 text-sm',
  xl: 'size-10 text-sm',
} as const;

interface PlayerAvatarProps {
  name: string;
  /** A posição define a cor. Sem ela (ainda carregando, por exemplo), o círculo fica cinza. */
  position?: Position;
  size?: keyof typeof SIZE;
}

// As iniciais do jogador num círculo da cor da posição dele.
export function PlayerAvatar({ name, position, size = 'md' }: PlayerAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-medium',
        SIZE[size],
        position ? positionTone(position) : 'bg-muted',
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
