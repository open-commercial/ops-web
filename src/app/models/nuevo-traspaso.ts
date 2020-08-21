export interface NuevoTraspaso {
  idSucursalOrigen: number;
  idSucursalDestino: number;
  // idProductoConCantidad: { [key: number]: number };
  idProducto: number[];
  cantidad: number[];
}
