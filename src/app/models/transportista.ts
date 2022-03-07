import { Ubicacion } from './ubicacion';

export interface Transportista {
  idTransportista: number;
  nombre: string;
  ubicacion: Ubicacion;
  web: string;
  telefono: string;
  eliminado?: boolean;
}
