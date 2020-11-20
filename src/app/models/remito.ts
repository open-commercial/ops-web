import {Transportista} from './transportista';

export interface Remito {
  idRemito: number;
  fecha: Date;
  serie: number;
  nroRemito: number;
  cantidadDeBultos: number;
  categoriaIVACliente: string;
  costoDeEnvio: number;
  detalleEnvio: string;
  eliminado: boolean;
  idCliente: number;
  idSucursal: number;
  idTransportista: number;
  idUsuario: number;
  nombreFiscalCliente: string;
  nombreSucursal: string;
  nombreTransportista: string;
  nombreUsuario: string;
  nroDeCliente: string;
  observaciones: string;
  pesoTotalEnKg: number;
  total: number;
  totalFacturas: number;
  transportista: Transportista;
  volumenTotalEnM3: number;
}
