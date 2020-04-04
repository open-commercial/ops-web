import { CategoriaIVA } from './categoria-iva';
import { Factura } from './factura';

export interface FacturaVenta extends Factura {
  idCliente: number;
  nombreFiscalCliente: string;
  nroDeCliente: string;
  categoriaIVACliente: CategoriaIVA;
  idViajanteCliente: number;
  nombreViajanteCliente: string;
  ubicacionCliente: string;
}
