import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  static getQueryString(terminos: {}) {
    const qsArray = [];
    for (const value in terminos) {
      if (terminos.hasOwnProperty(value)) {
        qsArray.push(value + '=' + encodeURIComponent(terminos[value]));
      }
    }
    return qsArray.join('&');
  }

  constructor() {}
}
