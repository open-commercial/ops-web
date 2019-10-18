import {CategoriaIVA} from './categoria-iva';
import {Ubicacion} from './ubicacion';

export interface Cliente {
  id_Cliente: number;
  bonificacion: number;
  nroCliente: string;
  nombreFiscal: string;
  nombreFantasia: string;
  categoriaIVA: CategoriaIVA;
  idFiscal: number;
  email: string;
  telefono: string;
  contacto: string;
  fechaAlta: Date;
  idViajante: number;
  nombreViajante: string;
  idCredencial: number;
  nombreCredencial: string;
  predeterminado: boolean;
  ubicacionFacturacion: Ubicacion;
  ubicacionEnvio: Ubicacion;
}

