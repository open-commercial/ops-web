export interface RenglonFactura  {
  idRenglonFactura: number;
  idProductoItem: number;
  codigoItem: string;
  descripcionItem: string;
  medidaItem: string;
  cantidad: number;
  precioUnitario: number;
  bonificacionPorcentaje: number;
  bonificacionNeta: number;
  ivaPorcentaje: number;
  ivaNeto: number;
  gananciaPorcentaje: number;
  gananciaNeto: number;
  importeAnterior: number;
  importe: number;
}
