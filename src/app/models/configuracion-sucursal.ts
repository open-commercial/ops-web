export interface ConfiguracionSucursal {
  idConfiguracionSucursal: number;
  usarFacturaVentaPreImpresa: boolean;
  cantidadMaximaDeRenglonesEnFactura: number;
  facturaElectronicaHabilitada: boolean;
  certificadoAfip?: number[];
  existeCertificado?: boolean;
  firmanteCertificadoAfip?: string;
  passwordCertificadoAfip?: string;
  nroPuntoDeVentaAfip?: number;
  puntoDeRetiro: boolean;
  predeterminada: boolean;
  comparteStock: boolean;
  vencimientoLargo: number;
  vencimientoCorto: number;
  idSucursal: number;
  nombreSucursal?: string;
}
