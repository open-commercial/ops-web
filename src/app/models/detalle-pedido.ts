import { TipoDeEnvio } from './tipo-de-envio';
import { NuevoRenglonPedido } from './nuevo-renglon-pedido';

export interface DetallePedido {
  idPedido: number;
  idSucursal: number;
  observaciones: string;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  renglones: Array<NuevoRenglonPedido>;
  recargoPorcentaje: number;
  descuentoPorcentaje: number;
}
