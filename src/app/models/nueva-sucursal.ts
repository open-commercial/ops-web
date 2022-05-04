import { Ubicacion } from './ubicacion';
import { CategoriaIVA } from './categoria-iva';

export interface NuevaSucursal {
  nombre: string;
  lema?: string;
  categoriaIVA: CategoriaIVA;
  idFiscal?: number;
  ingresosBrutos?: number;
  fechaInicioActividad?: Date;
  email: string;
  telefono?: string;
  ubicacion: Ubicacion;
  imagen?: number[];
}
