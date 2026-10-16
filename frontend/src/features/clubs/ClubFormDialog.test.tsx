import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubFormDialog } from './ClubFormDialog';

const createClub = vi.fn();
vi.mock('../../services/clubs', () => ({
  createClub: (input: unknown) => createClub(input),
  listClubs: vi.fn(),
  getClub: vi.fn(),
}));

function renderDialog() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ClubFormDialog clubs={[]} onClose={() => undefined} />
    </QueryClientProvider>,
  );
}

describe('ClubFormDialog', () => {
  beforeEach(() => createClub.mockReset());

  it('mostra os erros junto dos campos e não envia nada com o formulário vazio', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Criar clube' }));

    expect(await screen.findByText('Informe o nome do clube.')).toBeInTheDocument();
    expect(screen.getByText('Informe a sigla.')).toBeInTheDocument();
    expect(createClub).not.toHaveBeenCalled();
  });

  it('sugere a sigla a partir do nome e envia nome e sigla ao criar', async () => {
    createClub.mockResolvedValue({
      id: 1,
      name: 'Leões do Sul',
      acronym: 'LEO',
      cash: 300,
      squad_value: 0,
      net_worth: 300,
    });
    renderDialog();

    await userEvent.type(screen.getByLabelText('Nome'), 'Leões do Sul');
    expect(screen.getByLabelText('Sigla')).toHaveValue('LEO');

    await userEvent.click(screen.getByRole('button', { name: 'Criar clube' }));
    expect(createClub).toHaveBeenCalledWith({ name: 'Leões do Sul', acronym: 'LEO' });
  });
});
