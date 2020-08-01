import { CantidadEnSucursal } from './cantidad-en-sucursal';

export interface Producto {
  idProducto: number;
  codigo: string;
  descripcion: string;
  cantidadEnSucursales: Array<CantidadEnSucursal>;
  cantidadTotalEnSucursales?: number;
  hayStock?: boolean;
  cantMinima?: number;
  bulto: number;
  idMedida?: number;
  nombreMedida?: string;
  precioCosto: number|string;
  gananciaPorcentaje: number|string;
  gananciaNeto: number|string;
  precioVentaPublico: number|string;
  ivaPorcentaje: number|string;
  ivaNeto: number|string;
  precioLista: number|string;
  idRubro?: number;
  nombreRubro?: string;
  ilimitado?: boolean;
  publico: boolean;
  oferta: boolean;
  porcentajeBonificacionOferta: number|string;
  porcentajeBonificacionPrecio: number|string;
  precioBonificado?: number|string;
  fechaUltimaModificacion?: Date;
  idProveedor?: number;
  razonSocialProveedor?: string;
  nota: string;
  fechaAlta?: Date;
  fechaVencimiento: Date;
  eliminado?: boolean;
  urlImagen?: string;
  imagen?: number[];
}

