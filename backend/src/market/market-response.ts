import { TransactionResponse } from './transaction-response.js';

export class PurchaseContractResponse {
  /** Valor de mercado pago, sem a taxa. @example 37 */
  purchase_value!: number;

  /** Fim da fidelidade, no horário de Brasília. @example "2027-03-02T10:15:00-03:00" */
  loyalty_until!: string;

  /** Situação do contrato criado. @example "ATIVO" */
  status!: 'ATIVO';
}

export class PurchaseResponse extends TransactionResponse {
  /** Contrato criado na compra. */
  contract!: PurchaseContractResponse;

  /** Caixa do clube depois da compra. @example 261.15 */
  club_cash!: number;
}

export class SaleResponse extends TransactionResponse {
  /** Valor de compra gravado no contrato, sem a taxa. @example 37 */
  purchase_value!: number;

  /** Dias restantes de fidelidade, arredondados para cima. @example 117 */
  remaining_days!: number;

  /** Percentual da multa pelos dias restantes. @example 10 */
  penalty_rate!: number;

  /** Situação final do contrato: RESCINDIDO com multa, ENCERRADO sem. @example "RESCINDIDO" */
  contract_status!: 'RESCINDIDO' | 'ENCERRADO';

  /** Caixa do clube depois da venda. @example 296.85 */
  club_cash!: number;
}
