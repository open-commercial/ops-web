import {TipoDeComprobante} from '../tipo-de-comprobante';
import {Movimiento} from '../movimiento';

export interface BusquedaNotaCriteria {
  idSucursal?: number;
  cantidadDeRegistros?: number;
  buscaPorNumeroNota?: boolean;
  fechaDesde?: Date;
  fechaHasta?: Date;
  numSerie?: number;
  numNota?: number;
  buscaPorTipoComprobante?: boolean;
  tipoComprobante?: TipoDeComprobante;
  movimiento?: Movimiento;
  idUsuario?: number;
  idProveedor?: number;
  idCliente?: number;
  idViajante?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
