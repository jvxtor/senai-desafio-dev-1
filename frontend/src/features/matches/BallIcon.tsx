import type { SVGProps } from 'react';

// Bola de futebol: o lucide não tem uma, então vai aqui, no mesmo traço dos outros ícones.
export function BallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8.2l3.6 2.6-1.4 4.2H9.8L8.4 10.8z" fill="currentColor" />
      <path d="M12 3v5.2M20.6 9.4l-5-1.2M17.7 19.7l-3.5-4.5M6.3 19.7l3.5-4.5M3.4 9.4l5-1.2" />
    </svg>
  );
}
