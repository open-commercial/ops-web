export interface ProductosParaActualizar {
  idProducto: Array<number>;
  descuentoRecargoPorcentaje?: number|string;
  cantidadVentaMinima?: number|string;
  idMedida?: number;
  idRubro?: number;
  idProveedor?: number;
  gananciaPorcentaje?: number|string;
  ivaPorcentaje?: number|string;
  precioCosto?: number|string;
  porcentajeBonificacionPrecio?: number|string;
  porcentajeBonificacionOferta?: number|string;
  publico?: boolean;
}
