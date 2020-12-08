export interface Gasto {
  idGasto: number;
  nroGasto: number;
  fecha: Date;
  concepto: string;
  idSucursal: number;
  nombreSucursal: string;
  idUsuario: number;
  nombreUsuario: string;
  idFormaDePago: number;
  nombreFormaDePago: string;
  monto: number;
  eliminado: boolean;
}
