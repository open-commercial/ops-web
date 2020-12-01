export interface ProductoFaltante {
  idProducto: number;
  codigo: string;
  descripcion: string;
  cantidadSolicitada: number;
  cantidadDisponible: number;
  idSucursal: number;
  nombreSucursal: string;
}
