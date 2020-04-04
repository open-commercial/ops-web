import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Transportista } from '../models/transportista';

@Injectable({
  providedIn: 'root'
})
export class TransportistasService {
  public url = environment.apiUrl + '/api/v1/transportistas';

  constructor(private http: HttpClient) { }

  getTransportistas(): Observable<Transportista[]> {
    return this.http.get<Transportista[]>(this.url);
  }
}
