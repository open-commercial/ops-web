import {EstadoPedido} from '../estado.pedido';
import {TipoDeEnvio} from '../tipo-de-envio';

export interface BusquedaPedidoCriteria {
  idSucursal: number;
  fechaDesde?: number; // Timestap por eso el type number;
  fechaHasta?: number; // Timestap por eso el type number;
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
