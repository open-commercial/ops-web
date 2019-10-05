import { TipoDeComprobante } from '../tipo-de-comprobante';

export interface BusquedaFacturaCompraCriteria {
  idSucursal: number;
  fechaDesde?: number; // Timestamp
  fechaHasta?: number; // Timestamp
  idProveedor?: number;
  numSerie?: number;
  numFactura?: number;
  tipoComprobante?: TipoDeComprobante;
  idProducto?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
