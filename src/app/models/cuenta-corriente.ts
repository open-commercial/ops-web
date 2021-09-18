import { Cliente } from './cliente';
import {Proveedor} from './proveedor';

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

export interface CuentaCorrienteProveedor extends CuentaCorriente {
  proveedor: Proveedor;
}
