import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AttributePreview } from './AttributePreview';
import { EMPTY_PLAYER_FORM } from './validation';

const values = {
  ...EMPTY_PLAYER_FORM,
  pace: '70',
  shooting: '68',
  passing: '82',
  dribbling: '79',
  defending: '55',
  physical: '64',
  potential: '86',
};

describe('AttributePreview', () => {
  it('mostra em tempo real os valores digitados, com as barras e o potencial', () => {
    render(<AttributePreview values={values} />);
    const preview = screen.getByLabelText('Prévia dos atributos');

    for (const score of ['70', '68', '82', '79', '55', '64']) {
      expect(within(preview).getByText(score)).toBeInTheDocument();
    }
    expect(preview).toHaveTextContent('até o potencial (86)');
  });

  it('não desenha valor fora de 1 a 99', () => {
    render(<AttributePreview values={{ ...values, pace: '150' }} />);
    const preview = screen.getByLabelText('Prévia dos atributos');

    expect(within(preview).queryByText('150')).not.toBeInTheDocument();
    expect(within(preview).getAllByText('–').length).toBeGreaterThan(0);
  });
});
