import { Cliente } from './cliente';

export interface CuentaCorriente {
  idCuentaCorriente: number;
  eliminada: boolean;
  fechaApertura: Date;
  saldo: number;
  fechaUltimoMovimiento: Date;
}

export interface CuentaCorrienteCliente extends CuentaCorriente {
  cliente: Cliente;
}
