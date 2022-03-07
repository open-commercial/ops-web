import { Injectable } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Ubicacion } from '../models/ubicacion';
import * as moment from 'moment';
import {TipoDeComprobante} from '../models/tipo-de-comprobante';
import {CategoriaIVA} from '../models/categoria-iva';

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

  static getUnixDateFromNgbDate(dateObj: NgbDate): number {
    if (!dateObj) { return null; }
    return moment({ year: dateObj.year, month: dateObj.month - 1, day: dateObj.day }).unix();
  }

  static getDateFromNgbDate(dateObj: NgbDate): Date {
    if (!dateObj) { return null; }
    return new Date(HelperService.getUnixDateFromNgbDate(dateObj) * 1000);
  }

  static getFormattedDateFromNgbDate(dateObj: NgbDate): string {
    if (!dateObj) { return ''; }
    return [dateObj.day, dateObj.month, dateObj.year ].join('/');
  }

  static getNgbDateFromDate(date: Date): NgbDate {
    if (!date) { return null; }
    return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  static formatNumFactura(nSerie: number, nFac: number) {
    const nSerieString = nSerie !== null && nSerie >= 0 ? ('000' + nSerie).slice(-4) : 'XXXX';
    const nFacString = nFac !== null && nFac >= 0 ? ('0000000' + nFac).slice(-8) : 'XXXXXXXX';
    return nSerieString + '-' + nFacString;
  }

  static formatNumRemito(nSerie: number, nRem: number) {
    const nSerieString = nSerie !== null && nSerie >= 0 ? ('000' + nSerie).slice(-4) : 'XXXX';
    const nFacString = nRem !== null && nRem >= 0 ? ('0000000' + nRem).slice(-8) : 'XXXXXXXX';
    return nSerieString + '-' + nFacString;
  }

  static formatUbicacion(u: Ubicacion) {
    if (!u) { return ''; }
    const arr = [];
    arr.push(u.calle ? u.calle : '');
    arr.push(u.numero ? u.numero : '');
    arr.push(u.piso ? u.piso : '');
    arr.push(u.departamento ? u.departamento : '');
    arr.push(u.nombreLocalidad ? u.nombreLocalidad : '');
    arr.push(u.nombreProvincia ? u.nombreProvincia : '');
    return arr.join(' ');
  }

  static isEmptyObject(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object;
  }

  static tipoComprobanteLabel(tc: TipoDeComprobante) {
    return tc.toString().replace(/_/g, ' ');
  }

  static categoriaIVALabel(ci: CategoriaIVA) {
    return ci.toString().replace(/_/g, ' ');
  }

  static addParamToTerminos<T>(
    terminos: T | {}, name: string, value: any,
    config: { defaultValue?: any, checkNaN?: boolean, callback?: (v: any) => any } = {}
  ) {
    const defaultValue = config.defaultValue || null;
    const checkNaN = config.checkNaN || false;
    const callback = config.callback || ((v) => v);

    if (!value) {
      if (!!defaultValue) { terminos[name] = defaultValue; }
      return;
    }
    if (checkNaN) {
      if (isNaN(value)) { return; }
      value = Number(value);
    }
    terminos[name] = callback(value);
  }

  static paramsToTerminos<T>(
    params: { [key: string]: string },
    config: { [key: string]: { name?: string, defaultValue?: any, checkNaN?: boolean, callback?: (v: any) => any }},
    initialValue: T | {},
  ): T {
    const output = initialValue || {};
    for (const k in params) {
      if (params.hasOwnProperty(k)) {
        const c = config[k] || null;
        if (c) {
          const name = c.name || k;
          const value = params[k];
          const defaultValue = c.defaultValue || null;
          const checkNaN = c.checkNaN || false;
          const callback = c.callback || ((v) => v);
          HelperService.addParamToTerminos<T>(output, name, value, { defaultValue, checkNaN, callback });
        } else {
          HelperService.addParamToTerminos<T>(output, k, params[k]);
        }
      }
    }

    // set defaults
    for (const k in config) {
      if (config.hasOwnProperty(k) && !!config[k].defaultValue) {
        if (!output.hasOwnProperty(k)) {
          output[k] = config[k].defaultValue;
        }
      }
    }

    return output as T;
  }

  static timestampToDate: (v: number) => Date = (v) => {
    const d = moment.unix(v).local();
    return d.toDate();
  }
}
