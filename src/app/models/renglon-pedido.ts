export interface RenglonPedido {
  idRenglonPedido: number;
  idProductoItem: number;
  codigoItem: string;
  descripcionItem: string;
  medidaItem: string;
  urlImagenItem: string;
  oferta: boolean;
  precioUnitario: number;
  cantidad: number;
  bonificacionPorcentaje: number;
  bonificacionNeta: number;
  subTotal: number;
  importeAnterior: number;
  importe: number;
  // estos dos de abajo se usan para la vista, no vienen del backend
  errorDisponibilidad?: string;
  errorDisponibilidadPorSucursal?: string[];
}
