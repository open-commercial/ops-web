import { Injectable } from '@angular/core';
import * as SecureLS from 'secure-ls';

export enum StorageKeys {
  ID_SUCURSAL = 'idSucursal',
  APP_VERSION = 'appVersion',
  TOKEN = 'token',
  NUEVO_PEDIDO = 'nuevoPedido',
  EDITAR_PEDIDO = 'editarPedido',
  FACTURAR_PEDIDO = 'facturarPedido'
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private ls = new SecureLS({ encodingType: 'aes' });
  constructor() { }

  getItem(key: string) {
    return this.ls.get(key);
  }

  setItem(key: string, data: any) {
    this.ls.set(key, data);
  }

  removeItem(key: string) {
    this.ls.remove(key);
  }

  clear() {
    this.ls.clear();
  }
}
