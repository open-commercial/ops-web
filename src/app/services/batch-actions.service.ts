import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {StorageService} from './storage.service';
import {Producto} from '../models/producto';
import {FacturaVenta} from '../models/factura-venta';
import {HelperService} from './helper.service';

export enum BatchActionKey {
  PRODUCTOS = 'ba-productos',
  FACTURAS_VENTA = 'ba-facturas-venta',
}

export interface BatchActionElement {
  id: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class BatchActionsService {
  static getBatchElementFn(key: BatchActionKey): (item: any) => BatchActionElement {
    if (key === BatchActionKey.PRODUCTOS) {
      return (item: Producto) => ({
        id: item.idProducto,
        description: item.codigo ? (item.codigo + ' - ' + item.descripcion) : item.descripcion,
      });
    }
    if (key === BatchActionKey.FACTURAS_VENTA) {
      return (item: FacturaVenta) => ({
        id: item.idFactura,
        description: [
          item.tipoComprobante.toString().replace('_', ' '),
          ' ',
          item.numSerieAfip
          ? HelperService.formatNumFactura(item.numSerieAfip, item.numFacturaAfip)
          : HelperService.formatNumFactura(item.numSerie, item.numFactura)
        ].join('')
      });
    }
    throw new Error('Unknown BatchActionKey');
  }

  constructor(private authService: AuthService,
              private storageService: StorageService) { }

  addElement(key: BatchActionKey, element: BatchActionElement) {
    const data = this.getTokenData(key);
    data[element.id] = { id: element.id, description: element.description };
    this.setTokenData(key, data);
  }

  removeElememt(key: BatchActionKey, elementId: number) {
    const data = this.getTokenData(key);
    delete data[elementId];
    this.setTokenData(key, data);
  }

  getElement(key: BatchActionKey, elementId: number): BatchActionElement {
    const data = this.getTokenData(key);
    return data.hasOwnProperty(elementId) ? data[elementId] : null;
  }

  hasElement(key: BatchActionKey, elementId: number): boolean {
    const data = this.getTokenData(key);
    return data.hasOwnProperty(elementId);
  }

  getElements(key: BatchActionKey): BatchActionElement[] {
    const data = this.getTokenData(key);
    return Object.values(data);
  }

  clear(key: BatchActionKey) {
    this.setTokenData(key, {});
  }

  count(key: BatchActionKey): number {
    return this.getElements(key).length;
  }

  /**
   * Devuelve todos los datos de un token para una key
   */
  private getTokenData(key: BatchActionKey): any {
    const token = this.authService.getToken();
    if (!token) { throw new Error('Sin usuario logueado'); }
    const allData = this.storageService.getItem(key.toString()) || {};
    return allData.hasOwnProperty(token) ? allData[token] : {};
  }

  /**
   * Setea todos los datos de un token para una key
   */
  private setTokenData(key: BatchActionKey, data: any) {
    const token = this.authService.getToken();
    if (!token) { throw new Error('Sin usuario logueado'); }
    const allData = this.storageService.getItem(key.toString()) || {};
    allData[token] = data;
    this.storageService.setItem(key, allData);
  }
}
