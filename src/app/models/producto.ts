export interface Producto {
  idProducto: number;
  hayStock: boolean;
  codigo: string;
  descripcion: string;
  nombreMedida: string;
  nombreRubro: string;
  precioLista: number;
  precioBonificado: number;
  ventaMinima: number;
  urlImagen: string;
}
