import { CantidadEnSucursal } from './cantidad-en-sucursal';

export interface Producto {
  idProducto: number;
  codigo: string;
  descripcion: string;
  cantidadTotalEnSucursales: Array<CantidadEnSucursal>;
  cantidad: number;
  hayStock: boolean;
  cantMinima: number;
  bulto: number;
  nombreMedida: string;
  precioCosto: number;
  gananciaPorcentaje: number;
  gananciaNeto: number;
  precioVentaPublico: number;
  ivaPorcentaje: number;
  ivaNeto: number;
  precioLista: number;
  nombreRubro: string;
  ilimitado: boolean;
  publico: boolean;
  oferta: boolean;
  porcentajeBonificacionOferta: number;
  precioListaBonificado: number;
  fechaUltimaModificacion: Date;
  estanteria: string;
  estante: string;
  razonSocialProveedor: string;
  nota: string;
  fechaAlta: Date;
  fechaVencimiento: Date;
  eliminado: boolean;
  urlImagen: string;
}
