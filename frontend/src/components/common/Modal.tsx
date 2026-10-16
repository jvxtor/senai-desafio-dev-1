import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Ícone num círculo verde acima do título, para telas de resultado. */
  icon?: ReactNode;
  children: ReactNode;
  /** Largura máxima do painel. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASS = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-[min(64rem,calc(100%-2rem))]',
} as const;

export function Modal(props: ModalProps) {
  const { open, onClose, title, description, icon, children, size = 'md' } = props;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={`max-h-[calc(100svh-2rem)] overflow-y-auto ${SIZE_CLASS[size]}`}>
        <DialogHeader>
          {icon && (
            <span
              aria-hidden="true"
              className="mb-1 grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"
            >
              {icon}
            </span>
          )}
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
