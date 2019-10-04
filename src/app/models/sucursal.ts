import {Ubicacion} from './ubicacion';
import { CategoriaIVA } from './categoria-iva';

export interface Sucursal {
  idSucursal: number;
  nombre: string;
  lema: string;
  categoriaIVA: CategoriaIVA;
  idFiscal: number;
  ingresosBrutos: number;
  fechaInicioActividad: Date;
  email: string;
  telefono: string;
  ubicacion: Ubicacion;
  logo: string;
  eliminada: boolean;
}
