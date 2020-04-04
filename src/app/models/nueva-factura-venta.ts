import { TipoDeComprobante } from './tipo-de-comprobante';
import { NuevoRenglonFactura } from './nuevo-renglon-factura';

export interface NuevaFacturaVenta {
  idSucursal: number;
  idPedido: number;
  idCliente: number;
  idTransportista: number;
  fechaVencimiento: Date;
  tipoDeComprobante: TipoDeComprobante;
  observaciones: string;
  renglones: Array<NuevoRenglonFactura>;
  idsFormaDePago: Array<number>;
  montos: Array<number>;
  indices: Array<number>;
  recargoPorcentaje: number;
  descuentoPorcentaje: number;
}
