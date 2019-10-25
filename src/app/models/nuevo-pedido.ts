import { TipoDeEnvio } from './tipo-de-envio';
import { RenglonPedido } from './renglon-pedido';

export interface NuevoPedido {
  fechaVencimiento: Date;
  observaciones: string;
  idSucursal: number;
  tipoDeEnvio: TipoDeEnvio;
  idSucursalEnvio: number;
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


