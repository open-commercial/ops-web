import {EstadoPedido} from '../estado.pedido';
import {TipoDeEnvio} from '../tipo-de-envio';

export interface BusquedaPedidoCriteria {
  idSucursal: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  idCliente?: number;
  idUsuario?: number;
  idViajante?: number;
  nroPedido?: number;
  estadoPedido?: EstadoPedido;
  tipoDeEnvio?: TipoDeEnvio;
  idProducto?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
