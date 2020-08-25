import { Usuario } from './usuario';

export interface Traspaso {
  idTraspaso: number;
  fechaDeAlta: Date;
  idSucursalDestino: number;
  idSucursalOrigen: number;
  nombreSucursalDestino: string;
  nombreSucursalOrigen: string;
  nombreUsuario: string;
  nroPedido: number;
  nroTraspaso: string;
  usuario: Usuario;
}
