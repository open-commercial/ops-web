import {EstadoPedido} from './estado-pedido';
import { Cliente } from './cliente';
import { TipoDeEnvio } from './tipo-de-envio';

export interface Pedido {
  idPedido: number;
  nroPedido: number;
  fecha: Date;
  fechaVencimiento: Date;
  observaciones: string;
  idSucursal: number;
  nombreSucursal: string;
  eliminado: boolean;
  cliente: Cliente;
  nombreUsuario: string;
  subTotal: number;
  recargoPorcentaje: number;
  recargoNeto: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  total: number;
  estado: EstadoPedido;
  cantidadArticulos: number;
  detalleEnvio: string;
  tipoDeEnvio: TipoDeEnvio;
  idViajante: number;
  nombreViajante: string;
}
