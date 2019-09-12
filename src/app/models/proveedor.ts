import { CategoriaIVA } from './categoria-iva';
import { Ubicacion } from './ubicacion';

export interface Proveedor {
  id_Proveedor: number;
  nroProveedor: string;
  razonSocial: string;
  categoriaIVA: CategoriaIVA;
  idFiscal: number;
  telPrimario: string;
  telSecundario: string;
  contacto: string;
  email: string;
  web: string;
  ubicacion: Ubicacion;
  idEmpresa: number;
  nombreEmpresa: string;
}
