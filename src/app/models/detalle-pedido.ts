import { TipoDeEnvio } from './tipo-de-envio';
import { NuevoRenglonPedido } from './nuevo-renglon-pedido';

export interface DetallePedido {
  idPedido: number;
  idSucursal: number;
  observaciones: string;
  idCliente: number;
  tipoDeEnvio: TipoDeEnvio;
  renglones: Array<NuevoRenglonPedido>;
  idsFormaDePago: Array<number>;
  montos: Array<number>;
  recargoPorcentaje: number;
  descuentoPorcentaje: number;
}
