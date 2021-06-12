import {TipoDeComprobante} from './tipo-de-comprobante';
import {RenglonNotaCredito} from './renglon-nota-credito';
import {RenglonNotaDebito} from './renglon-nota-debito';

export interface Nota {
  idNota: number;
  serie: number;
  nroNota: number;
  eliminada: boolean;
  tipoComprobante: TipoDeComprobante;
  fecha: Date;
  idSucursal: number;
  nombreSucursal: string;
  idCliente: number;
  nombreFiscalCliente: string;
  idViajante: number;
  nombreViajante: string;
  idFacturaVenta: number;
  idProveedor: number;
  razonSocialProveedor: string;
  idFacturaCompra: number;
  idUsuario: number;
  nombreUsuario: string;
  motivo: string;
  subTotalBruto: number|string;
  iva21Neto: number|string;
  iva105Neto: number|string;
  total: number|string;
  cae: number;
  vencimientoCae: Date;
  numSerieAfip: number;
  numNotaAfip: number;
}

export interface NotaCredito extends Nota {
  modificaStock: boolean;
  renglonesNotaCredito: RenglonNotaCredito[];
  subTotal: number|string;
  recargoPorcentaje: number|string;
  recargoNeto: number|string;
  descuentoPorcentaje: number|string;
  descuentoNeto: number|string;
}

export interface NotaDebito extends Nota {
  renglonesNotaDebito: RenglonNotaDebito[];
  montoNoGravado: number;
  idRecibo: number;
  pagada: boolean;
}
