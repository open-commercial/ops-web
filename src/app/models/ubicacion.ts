export interface Ubicacion {
  idUbicacion: number;
  descripcion: string;
  latitud: number;
  longitud: number;
  calle: string;
  numero: number;
  piso: number;
  departamento: string;
  eliminada: boolean;
  idLocalidad: number;
  nombreLocalidad: string;
  codigoPostal: number;
  idProvincia: number;
  nombreProvincia: string;
}
