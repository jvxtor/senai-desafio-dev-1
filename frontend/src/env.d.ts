interface ImportMetaEnv {
  /** Endereço da API visto pelo navegador, com o prefixo /api/v1. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
