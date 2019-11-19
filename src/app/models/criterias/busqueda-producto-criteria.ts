export interface BusquedaProductoCriteria {
  codigo?: string;
  descripcion?: string;
  idRubro?: number;
  idProveedor?: number;
  idEmpresa?: number;
  listarSoloFaltantes?: boolean;
  listarSoloEnStock?: boolean;
  publico?: boolean;
  destacado?: boolean;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
