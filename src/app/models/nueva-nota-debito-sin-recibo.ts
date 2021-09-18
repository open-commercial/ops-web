import {TipoDeComprobante} from './tipo-de-comprobante';

export interface NuevaNotaDebitoSinRecibo {
  idCliente?: number;
  idProveedor?: number;
  idSucursal?: number;
  motivo: string;
  gastoAdministrativo: number;
  tipoDeComprobante: TipoDeComprobante;
}
