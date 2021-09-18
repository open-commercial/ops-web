import {TipoDeComprobante} from './tipo-de-comprobante';
import {DetalleCompra} from './detalle-compra';

export interface NuevaNotaCreditoSinFactura {
  idCliente?: number;
  idProveedor?: number;
  idSucursal: number;
  monto: number;
  tipo: TipoDeComprobante;
  detalle: string;
  motivo?: string;
  detalleCompra?: DetalleCompra;
}
