import {CategoriaIVA} from './categoria-iva';
import {Ubicacion} from './ubicacion';

export interface Cliente {
  idCliente: number;
  nroCliente: string;
  nombreFiscal: string;
  nombreFantasia: string;
  categoriaIVA: CategoriaIVA;
  idFiscal: string;
  ubicacionFacturacion: Ubicacion;
  ubicacionEnvio: Ubicacion;
  email: string;
  telefono: string;
  contacto: string;
  fechaAlta: Date;
  idViajante: number;
  nombreViajante: string;
  idCredencial: number;
  nombreCredencial: string;
  predeterminado: boolean;
  saldoCuentaCorriente: number;
  montoCompraMinima: number;
  detalleUbicacionDeFacturacion: string;
  detalleUbicacionDeEnvio: string;
}
