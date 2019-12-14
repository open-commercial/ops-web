import { TipoDeComprobante } from '../tipo-de-comprobante';

export interface BusquedaFacturaCompraCriteria {
  idSucursal: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  idProveedor?: number;
  numSerie?: number;
  numFactura?: number;
  tipoComprobante?: TipoDeComprobante;
  idProducto?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
