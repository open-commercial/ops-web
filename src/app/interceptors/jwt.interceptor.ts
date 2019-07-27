import {Injectable, Injector} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthService} from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  // https://github.com/angular/angular/issues/18224
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = this.injector.get(AuthService);
    const token = auth.getToken();
    if (token) {
      request = request.clone({setHeaders: {Authorization: `Bearer ${token}`}});
    }
    return next.handle(request)
      .pipe(
        catchError(err => {
          if (err.status === 401 || err.status === 403) { auth.logout(); }
          return throwError(err);
        })
      )
    ;
  }
}
