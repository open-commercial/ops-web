import {DetalleCompra} from './detalle-compra';

export interface NuevaNotaCreditoDeFactura {
  idFactura: number;
  cantidades: Array<number|string>;
  idsRenglonesFactura: number[];
  modificaStock: boolean;
  motivo: string;
  detalleCompra?: DetalleCompra;
}
