import { TipoDeComprobante } from './tipo-de-comprobante';

export interface MovimientoCaja {
  idMovimiento: number;
  tipoComprobante: TipoDeComprobante;
  concepto: string;
  fecha: Date;
  monto: number;
}
