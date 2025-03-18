import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class LoadingOverlayService {
  private count = 0;
  private loadingOvelaySubject: BehaviorSubject<boolean>;

  constructor() {
    this.loadingOvelaySubject = new BehaviorSubject<boolean>(false);
  }

  activate() {
    this.count += 1;
    this.loadingOvelaySubject.next(this.isActive());
  }

  deactivate() {
    this.count -= 1;
    this.loadingOvelaySubject.next(this.isActive());
  }

  isActive() {
    return this.count > 0;
  }

  getValue(): Observable<boolean> {
    return this.loadingOvelaySubject.asObservable();
  }
}
