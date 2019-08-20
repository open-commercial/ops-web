import {CategoriaIVA} from './categoria-iva';
import {Ubicacion} from './ubicacion';

export interface Cliente {
  id_Cliente: number;
  nroCliente: string;
  nombreFiscal: string;
  nombreFantasia: string;
  bonificacion: number;
  categoriaIVA: CategoriaIVA;
  idFiscal: string;
  email: string;
  telefono: string;
  ubicacionFacturacion: Ubicacion;
  ubicacionEnvio: Ubicacion;
  contacto: string;
  fechaAlta: Date;
  idEmpresa: number;
  nombreEmpresa: string;
  idViajante: number;
  nombreViajante: string;
  idCredencial: number;
  nombreCredencial: string;
  predeterminado: boolean;
}
