import { CategoriaIVA } from './categoria-iva';
import { Ubicacion } from './ubicacion';

export interface Proveedor {
  idProveedor: number;
  nroProveedor?: string;
  razonSocial: string;
  categoriaIVA: CategoriaIVA;
  idFiscal: number;
  telPrimario: string;
  telSecundario: string;
  contacto: string;
  email: string;
  web: string;
  ubicacion: Ubicacion;
  idEmpresa?: number;
  nombreEmpresa?: string;
}
