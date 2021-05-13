import {TipoDeComprobante} from './tipo-de-comprobante';

export interface RenglonCuentaCorriente {
  idRenglonCuentaCorriente: number;
  idMovimiento: number;
  descripcion: string;
  eliminado: boolean;
  fecha: Date;
  idSucursal: number;
  monto: number;
  nombreSucursal: string;
  numero: number;
  saldo: number;
  serie: number;
  tipoComprobante: TipoDeComprobante;
}
