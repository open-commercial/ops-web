import { Injectable } from '@angular/core';
import * as SecureLS from 'secure-ls';
import { AuthService } from './auth.service';

export enum BatchActionKey {
  PRODUCTOS = 'PRODUCTOS',
}

export interface BatchActionElement {
  id: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class BatchActionsService {
  private ls = new SecureLS({ encodingType: 'aes' });

  constructor(private authService: AuthService) { }

  addElement(key: BatchActionKey, element: BatchActionElement) {}

  removeElememt(key: BatchActionKey, elementId: number) {}

  getElement(key: BatchActionKey, elementId: number): BatchActionElement { return null; }

  getElements(key: BatchActionKey): BatchActionElement[] { return []; }
}
