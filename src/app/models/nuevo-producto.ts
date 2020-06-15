export interface NuevoProducto {
  codigo: string;
  descripcion: string;
  cantidadEnSucursal: { [key: number]: number };
  hayStock: boolean;
  cantMinima: number;
  bulto: number;
  precioCosto: number;
  gananciaPorcentaje: number;
  gananciaNeto: number;
  precioVentaPublico: number;
  ivaPorcentaje: number;
  ivaNeto: number;
  oferta: boolean;
  imagen: any;
  porcentajeBonificacionOferta: number;
  porcentajeBonificacionPrecio: number;
  precioBonificado: number;
  precioLista: number;
  ilimitado: boolean;
  publico: boolean;
  fechaUltimaModificacion: Date | number;
  estanteria: string;
  estante: string;
  nota: string;
  fechaVencimiento: Date | number;
}

