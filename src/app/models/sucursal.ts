import {Ubicacion} from './ubicacion';
import { CategoriaIVA } from './categoria-iva';
import {ConfiguracionScursal} from './configuracion-scursal';

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
  detalleUbicacion: string;
  logo: string;
  eliminada: boolean;
  configuracionSucursal: ConfiguracionScursal;
}
