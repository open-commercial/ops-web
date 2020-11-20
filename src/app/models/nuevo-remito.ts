import {TipoBulto} from './tipo-bulto';

export interface NuevoRemito {
  idFacturaVenta: number[];
  idTransportista: number;
  tiposDeBulto: TipoBulto[];
  cantidadPorBulto: number[];
  costoDeEnvio: number;
  pesoTotalEnKg: number;
  volumenTotalEnM3: number;
  observaciones: string;
}
