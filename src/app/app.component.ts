import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { StorageKeys, StorageService } from './services/storage.service';
import { PreviousRouteService } from './services/previous-route.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  envQA = environment.qa;
  title = 'sic-ops-web';

  constructor(private storageService: StorageService,
              private previousRouteService: PreviousRouteService) {
    this.checkAppVersion();
    this.previousRouteService.init();
  }

  checkAppVersion() {
    if (environment.appVersion !== this.storageService.getItem('appVersion')) {
      this.storageService.clear();
      this.storageService.setItem(StorageKeys.APP_VERSION, environment.appVersion);
    }
  }
}
