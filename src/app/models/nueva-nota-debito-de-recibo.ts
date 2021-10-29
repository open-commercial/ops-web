import {TipoDeComprobante} from './tipo-de-comprobante';
import {DetalleCompra} from './detalle-compra';

export interface NuevaNotaDebitoDeRecibo {
  idRecibo: number;
  gastoAdministrativo: number;
  motivo: string;
  tipoDeComprobante: TipoDeComprobante;
  detalleCompra?: DetalleCompra;
}
