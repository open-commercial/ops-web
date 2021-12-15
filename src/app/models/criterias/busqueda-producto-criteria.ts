export interface BusquedaProductoCriteria {
  codigo?: string;
  descripcion?: string;
  idRubro?: number;
  idProveedor?: number;
  listarSoloFaltantes?: boolean;
  listarSoloEnStock?: boolean;
  publico?: boolean;
  oferta?: boolean;
  pagina: number;
  ordenarPor?: string[];
  sentido?: string;
  listarSoloParaCatalogo?: boolean;
}
