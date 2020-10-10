import { Factura } from './factura';

export interface FacturaCompra extends Factura {
  idProveedor: number;
  razonSocialProveedor: string;
  fechaAlta: Date;
}
