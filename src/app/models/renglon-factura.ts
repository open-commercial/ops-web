export interface RenglonFactura  {
  idRenglonFactura: number;
  idProductoItem: number;
  codigoItem: string;
  descripcionItem: string;
  medidaItem: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  ivaPorcentaje: number;
  ivaNeto: number;
  impuestoPorcentaje: number;
  impuestoNeto: number;
  gananciaPorcentaje: number;
  gananciaNeto: number;
  importe: number;
}
