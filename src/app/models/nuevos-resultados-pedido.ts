import { RenglonPedido } from './renglon-pedido';

export interface NuevosResultadosPedido {
  renglones: Array<RenglonPedido>;
  descuentoPorcentaje: number;
  recargoPorcentaje: number;
}
