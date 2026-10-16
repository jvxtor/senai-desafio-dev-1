import type { ComponentProps } from 'react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type IconButtonProps = Omit<ComponentProps<typeof Button>, 'variant' | 'size'> & {
  /** Texto curto da dica, como "Editar". */
  label: string;
  /** Nome acessível completo, como "Editar André Lacerda". Sem ele, vale o `label`. */
  ariaLabel?: string;
};

/** Botão só de ícone: a dica aparece ao passar o mouse ou focar com o teclado. */
export function IconButton({ label, ariaLabel, children, ...props }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={ariaLabel ?? label} {...props} />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
