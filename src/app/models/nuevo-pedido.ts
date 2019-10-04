import { TipoDeEnvio } from './tipo-de-envio';
import { RenglonPedido } from './renglon-pedido';

export interface NuevoPedido {
  fechaVencimiento: Date;
  observaciones: string;
  idSucursal: number;
  idSucursalEnvio: number;
  tipoDeEnvio: TipoDeEnvio;
  idUsuario: number;
  idCliente: number;
  renglones: Array<RenglonPedido>;
  subTotal: number;
  recargoPorcentaje: number;
  recargoNeto: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  total: number;
}


