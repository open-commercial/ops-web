import { TipoDeEnvio } from './tipo-de-envio';
import { NuevoRenglonPedido } from './nuevo-renglon-pedido';

export interface NuevoPedido {
  observaciones: string;
  idSucursal: number;
  tipoDeEnvio: TipoDeEnvio;
  idUsuario: number;
  idCliente: number;
  renglones: Array<NuevoRenglonPedido>;
  recargoPorcentaje: number;
  descuentoPorcentaje: number;
}


