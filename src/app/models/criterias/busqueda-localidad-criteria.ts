export interface BusquedaLocalidadCriteria {
  nombre?: string;
  codigoPostal?: string;
  nombreProvincia?: string;
  envioGratuito?: boolean;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
