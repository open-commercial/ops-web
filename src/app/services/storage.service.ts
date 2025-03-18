import { Injectable } from '@angular/core';
import * as crypto from 'crypto-js';

export enum StorageKeys {  
  ID_SUCURSAL = 'idSucursal',
  TOKEN = 'token',
  PEDIDO_NUEVO = 'nuevoPedido',
  PEDIDO_EDITAR = 'editarPedido',
  PEDIDO_FACTURAR = 'facturarPedido',
  FACTURA_COMPRA_NUEVA = 'nuevaFacturaCompra',
}

@Injectable({providedIn: 'root'})
export class StorageService {

  getItem(key: string) {
    return this.decrypt(localStorage.getItem(key));
  }

  setItem(key: string, data: any) {
    localStorage.setItem(key, this.encrypt(data));
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  private static getSK() {
    return 'MaritoPagaElAsado2025!';
  }

  private encrypt(data: any): string {
    return crypto.AES.encrypt(JSON.stringify(data), StorageService.getSK()).toString();
  }

  private decrypt(data: string) {
    if (data === null || data === undefined) { return null; }
    const bytes = crypto.AES.decrypt(data, StorageService.getSK());
    return JSON.parse(bytes.toString(crypto.enc.Utf8));
  }
}
