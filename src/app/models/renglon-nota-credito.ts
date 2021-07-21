export interface RenglonNotaCredito {
  idRenglonNotaCredito: number;
  idProductoItem: number;
  codigoItem: string;
  descripcionItem: string;
  medidaItem: string;
  cantidad: number;
  precioUnitario: number;
  gananciaPorcentaje: number;
  gananciaNeto: number;
  importe: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  importeBruto: number;
  ivaPorcentaje: number;
  ivaNeto: number;
  importeNeto: number;
}
