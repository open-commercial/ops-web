export interface BusquedaCajaCriteria {
  idSucursal: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  idUsuarioApertura?: number;
  idUsuarioCierre?: number;
  pagina: number;
}
