import { Injectable } from '@angular/core';
import { EncryptStorage } from 'encrypt-storage';

export enum StorageKeys {
  ID_SUCURSAL = 'idSucursal',
  APP_VERSION = 'appVersion',
  TOKEN = 'token',
  PEDIDO_NUEVO = 'nuevoPedido',
  PEDIDO_EDITAR = 'editarPedido',
  PEDIDO_FACTURAR = 'facturarPedido',
  FACTURA_COMPRA_NUEVA = 'nuevaFacturaCompra',
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private es = new EncryptStorage(StorageService.getSK());

  getItem(key: string) {
    return this.es.getItem(key);
  }

  setItem(key: string, data: any) {
    this.es.setItem(key, data);
  }

  removeItem(key: string) {
    this.es.removeItem(key);
  }

  clear() {
    this.es.clear();
  }

  static getSK() {
    return 'MaritoPagaElAsado2025!';
  }
}
