import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  constructor() { }

  static getIdEmpresa() {
    return localStorage.getItem('idEmpresa');
  }

  static setIdEmpresa(idEmpresa: string) {
    localStorage.setItem('idEmpresa', idEmpresa);
  }
}
