export interface BusquedaTransportistaCriteria {
  nombre?: string;
  idProvincia?: number;
  idLocalidad?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
