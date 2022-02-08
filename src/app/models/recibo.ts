export interface Recibo {
  concepto: string;
  eliminado?: boolean;
  fecha?: Date;
  idCliente?: number;
  idFormaDePago?: number;
  idPagoMercadoPago?: number;
  idProveedor?: number;
  idRecibo?: number;
  idSucursal: number;
  idViajante?: number;
  monto: number;
  nombreFiscalCliente?: string;
  nombreFormaDePago?: string;
  nombreSucursal?: string;
  nombreUsuario?: string;
  nombreViajante?: string;
  numRecibo?: number;
  numSerie?: number;
  razonSocialProveedor?: string;
}
