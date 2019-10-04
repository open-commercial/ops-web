import { CategoriaIVA } from './categoria-iva';
import { TipoDeComprobante } from './tipo-de-comprobante';

export interface RenglonFactura  {
  id_RenglonFactura: number;
  idProductoItem: number;
  codigoItem: string;
  descripcionItem: string;
  medidaItem: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  ivaPorcentaje: number;
  ivaNeto: number;
  impuestoPorcentaje: number;
  impuestoNeto: number;
  gananciaPorcentaje: number;
  gananciaNeto: number;
importe: number;
}

export interface Factura {
  id_Factura: number;
  nombreUsuario: string;
  fecha: Date;
  tipoComprobante: TipoDeComprobante;
  numSerie: number;
  numFactura: number;
  fechaVencimiento: Date;
  nroPedido: number;
  idTransportista: number;
  nombreTransportista: string;
  renglones: RenglonFactura[];
  subTotal: number;
  recargoPorcentaje: number;
  recargoNeto: number;
  descuentoPorcentaje: number;
  descuentoNeto: number;
  subTotalBruto: number;
  iva105Neto: number;
  iva21Neto: number;
  total: number;
  observaciones: string;
  cantidadArticulos: number;
  idEmpresa: number;
  nombreEmpresa: string;
  eliminada: boolean;
  CAE: number;
  vencimientoCae: Date;
  numSerieAfip: number;
  numFacturaAfip: number;
}

export interface FacturaVenta extends Factura {
  idCliente: number;
  nombreFiscalCliente: string;
  nroDeCliente: string;
  categoriaIVACliente: CategoriaIVA;
  idViajanteCliente: number;
  nombreViajanteCliente: string;
  ubicacionCliente: string;
}

export interface BusquedaFacturaVentaCriteria {
  buscaPorFecha: boolean;
  fechaDesde: Date;
  fechaHasta: Date;
  buscaCliente: boolean;
  idCliente: number;
  buscaPorTipoComprobante: boolean;
  tipoComprobante: TipoDeComprobante;
  buscaUsuario: boolean;
  idUsuario: number;
  buscaViajante: boolean;
  idViajante: number;
  buscaPorNumeroFactura: boolean;
  numSerie: number;
  numFactura: number;
  buscarPorPedido: boolean;
  nroPedido: number;
  buscaPorProducto: boolean;
  idProducto: number;
  idEmpresa: number;
  pagina: number;
  ordenarPor: string;
  sentido: string;
}

export interface FacturaCompra extends Factura {
  idProveedor: number;
  razonSocialProveedor: string;
}

export interface BusquedaFacturaCompraCriteria {
  buscaPorFecha: boolean;
  fechaDesde: Date;
  fechaHasta: Date;
  buscaPorProveedor: boolean;
  idProveedor: number;
  buscaPorNumeroFactura: boolean;
  numSerie: number;
  numFactura: number;
  buscaPorTipoComprobante: boolean;
  tipoComprobante: TipoDeComprobante;
  buscaPorProducto: boolean;
  idProducto: number;
  idEmpresa: number;
  pagina: number;
  ordenarPor: string;
  sentido: string;
}
