export interface BusquedaTraspasoCriteria {
  fechaDesde?: Date;
  fechaHasta?: Date;
  nroTraspaso?: string;
  nroPedido?: number;
  idSucursalOrigen?: number;
  idSucursalDestino?: number;
  idUsuario?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
