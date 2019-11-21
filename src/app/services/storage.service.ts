import { Injectable } from '@angular/core';
import * as SecureLS from 'secure-ls';

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
