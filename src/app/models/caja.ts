import { EstadoCaja } from './estado-caja';

export interface Caja {
  idCaja: number;
  fechaApertura: Date;
  fechaCierre: Date;
  idSucursal: number;
  nombreSucursal: string;
  idUsuarioAbreCaja: number;
  nombreUsuarioAbreCaja: string;
  idUsuarioCierraCaja: number;
  nombreUsuarioCierraCaja: string;
  estado: EstadoCaja;
  saldoApertura: number;
  saldoSistema: number;
  saldoReal: number;
  // eliminada: boolean;
}
