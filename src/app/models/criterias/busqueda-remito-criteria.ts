export interface BusquedaRemitoCriteria {
  fechaDesde?: Date;
  fechaHasta?: Date;
  serieRemito?: number;
  nroRemito?: number;
  idCliente?: number;
  idSucursal: number;
  idUsuario?: number;
  idTransportista?: number;
  serieFacturaVenta?: number;
  nroFacturaVenta?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
