import { Router, RoutesRecognized } from '@angular/router';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, pairwise } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {

  public previousRoute$ = new BehaviorSubject<string>('');

  constructor(private router: Router) {}

  /**
   * Debe llamarse una sola vez en el AppComponent
   */
  init() {
    this.router.events.pipe(
      filter((e) => e instanceof RoutesRecognized),
      pairwise(),
      map((e: [RoutesRecognized, RoutesRecognized]) => {
        const url = e[0].url;
        if (url !== '') { this.previousRoute$.next(url) };
      })
    ).subscribe();
  }
}
