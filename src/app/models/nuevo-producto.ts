export interface NuevoProducto {
  codigo: string;
  descripcion: string;
  cantidadEnSucursal: { [key: number]: number };
  cantMinima: number;
  precioCosto: number|string;
  gananciaPorcentaje: number|string;
  gananciaNeto: number|string;
  precioVentaPublico: number|string;
  ivaPorcentaje: number|string;
  ivaNeto: number|string;
  oferta: boolean;
  porcentajeBonificacionOferta: number|string;
  porcentajeBonificacionPrecio: number|string;
  precioLista: number|string;
  ilimitado?: boolean;
  publico: boolean;
  paraCatalogo: boolean;
  fechaUltimaModificacion?: Date | number;
  nota: string;
  fechaVencimiento: Date | number;
  imagen?: number[];
}
