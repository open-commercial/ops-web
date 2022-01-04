export interface BusquedaGastoCriteria {
  idSucursal: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  idUsuario?: number;
  idFormaDePago?: number;
  nroGasto?: number;
  concepto?: string;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
