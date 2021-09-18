export interface BusquedaCuentaCorrienteProveedorCriteria {
  nroProveedor?: string;
  razonSocial?: string;
  idFiscal?: number;
  idProvincia?: number;
  idLocalidad?: number;
  pagina: number;
  ordenarPor?: string;
  sentido?: string;
}
