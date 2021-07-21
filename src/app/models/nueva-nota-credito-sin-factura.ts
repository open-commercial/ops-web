import {TipoDeComprobante} from './tipo-de-comprobante';

export interface NuevaNotaCreditoSinFactura {
  idCliente?: number;
  idProveedor?: number;
  idSucursal: number;
  monto: number;
  tipo: TipoDeComprobante;
  detalle: string;
  motivo?: string;
}
