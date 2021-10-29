import {TipoDeComprobante} from './tipo-de-comprobante';
import {DetalleCompra} from './detalle-compra';

export interface NuevaNotaDebitoSinRecibo {
  idCliente?: number;
  idProveedor?: number;
  idSucursal?: number;
  motivo: string;
  gastoAdministrativo: number;
  tipoDeComprobante: TipoDeComprobante;
  detalleCompra?: DetalleCompra;
}
