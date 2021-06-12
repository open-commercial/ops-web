import {TipoDeComprobante} from './tipo-de-comprobante';

export interface NuevaNotaDebitoDeRecibo {
  idRecibo: number;
  gastoAdministrativo: number;
  motivo: string;
  tipoDeComprobante: TipoDeComprobante;
}
