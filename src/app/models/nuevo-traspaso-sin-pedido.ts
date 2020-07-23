export interface NuevoTraspasoSinPedido {
  idSucursalOrigen: number;
  idSucursalDestino: number;
  idProductoConCantidad: { [key: number]: number };
}
