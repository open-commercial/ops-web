import { Rol } from '../rol';

export interface BusquedaUsuarioCriteria {
  username?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  roles?: Array<Rol>;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
