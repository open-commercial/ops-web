import { TipoDeComprobante } from './tipo-de-comprobante';

export interface NuevaFacturaVenta {
  idSucursal: number;
  idCliente: number;
  idTransportista: number;
  fechaVencimiento: Date;
  tipoDeComprobante: TipoDeComprobante;
  observaciones: string;
  renglonMarcado: Array<boolean>;
  idsFormaDePago: Array<number>;
  montos: Array<number>;
  indices: Array<number>;
  recargoPorcentaje: number;
  descuentoPorcentaje: number;
}

