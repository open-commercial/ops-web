import { TipoDeComprobante } from './tipo-de-comprobante';
import { RenglonFactura } from './renglon-factura';

export interface Factura {
  idFactura: number;
  nombreUsuario: string;
  fecha: Date;
  tipoComprobante: TipoDeComprobante;
  numSerie: number;
  numFactura: number;
  fechaVencimiento: Date;
  nroPedido: number;
  idTransportista: number;
  nombreTransportista: string;
  renglones: RenglonFactura[];
  subTotal: number;
  recargoPorcentaje: number;
  recargoNeto: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  subTotalBruto: number;
  iva105Neto: number;
  iva21Neto: number;
  total: number;
  observaciones: string;
  cantidadArticulos: number;
  idEmpresa: number;
  nombreEmpresa: string;
  eliminada: boolean;
  cae: number;
  vencimientoCae: Date;
  numSerieAfip: number;
  numFacturaAfip: number;
}
