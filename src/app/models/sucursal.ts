import {Ubicacion} from './ubicacion';
import { CategoriaIVA } from './categoria-iva';
import {ConfiguracionSucursal} from './configuracion-sucursal';

export interface Sucursal {
  idSucursal?: number;
  nombre: string;
  lema?: string;
  categoriaIVA: CategoriaIVA;
  idFiscal?: number;
  ingresosBrutos?: number;
  fechaInicioActividad?: Date;
  email: string;
  telefono?: string;
  ubicacion?: Ubicacion;
  detalleUbicacion?: string;
  logo?: string;
  eliminada?: boolean;
  configuracionSucursal?: ConfiguracionSucursal;
}
