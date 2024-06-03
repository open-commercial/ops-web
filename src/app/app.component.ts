import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { PreviousRouteService } from './services/previous-route.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private previousRouteService: PreviousRouteService) {
    this.checkAppVersion();
    this.previousRouteService.init();
  }

  checkAppVersion() {
    if (environment.appVersion !== localStorage.getItem('appVersion')) {
      localStorage.clear();
      localStorage.setItem('appVersion', environment.appVersion);
    }
  }
}
