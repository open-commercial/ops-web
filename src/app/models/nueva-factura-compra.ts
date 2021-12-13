import {TipoDeComprobante} from './tipo-de-comprobante';
import {NuevoRenglonFactura} from './nuevo-renglon-factura';

export interface NuevaFacturaCompra {
  idSucursal: number;
  idProveedor: number;
  idTransportista: number;
  numSerie: number;
  numFactura: number;
  fecha: Date;
  fechaVencimiento: Date;
  tipoDeComprobante: TipoDeComprobante;
  observaciones: string;
  renglones: NuevoRenglonFactura[];
  recargoPorcentaje: number;
  descuentoPorcentaje: number;
}
