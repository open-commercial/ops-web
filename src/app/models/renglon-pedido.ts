export interface RenglonPedido {
  id_RenglonPedido: number;
  idProductoItem: number;
  codigoItem: string;
  descripcionItem: string;
  medidaItem: string;
  precioUnitario: number;
  cantidad: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  importe: number;
}
