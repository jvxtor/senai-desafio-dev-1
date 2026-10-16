import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:3000/api/v1';
// Vazia ou ausente, vale o endereço padrão.
const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL;
const REQUEST_TIMEOUT_MS = 15_000;
const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar à API.';

export class ApiError extends Error {
  status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

async function readMessage(data: unknown): Promise<string | undefined> {
  // Nos downloads (responseType 'blob') o corpo do erro também chega como Blob.
  const body = data instanceof Blob ? await parseBlob(data) : data;
  const message = (body as { message?: unknown } | undefined)?.message;

  return typeof message === 'string' && message.length > 0
    ? message
    : undefined;
}

async function parseBlob(blob: Blob): Promise<unknown> {
  try {
    return JSON.parse(await blob.text());
  } catch {
    return undefined;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new ApiError(NETWORK_ERROR_MESSAGE);
    }

    const { status, data } = error.response;
    const message = await readMessage(data);

    throw new ApiError(message ?? error.message, status);
  },
);
