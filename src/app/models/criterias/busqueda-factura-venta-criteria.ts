import { TipoDeComprobante } from '../tipo-de-comprobante';

export interface BusquedaFacturaVentaCriteria {
  idSucursal: number;
  fechaDesde?: number; // Timestamp
  fechaHasta?: number; // Timestamp
  idCliente?: number;
  tipoComprobante?: TipoDeComprobante;
  idUsuario?: number;
  idViajante?: number;
  numSerie?: number;
  numFactura?: number;
  nroPedido?: number;
  idProducto?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
