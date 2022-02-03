import {Movimiento} from '../movimiento';

export interface BusquedaReciboCriteria {
  fechaDesde?: Date;
  fechaHasta?: Date;
  idSucursal: number;
  numSerie?: number;
  numRecibo?: number;
  concepto?: string;
  idCliente?: number;
  idProveedor?: number;
  idUsuario?: number;
  idViajante?: number;
  idFormaDePago?: number;
  movimiento: Movimiento;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
