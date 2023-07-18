import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { StorageKeys, StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  envQA = environment.qa;
  title = 'ops-web';
  constructor(private storageService: StorageService) {
    this.checkAppVersion();
  }

  checkAppVersion() {
    if (environment.appVersion !== this.storageService.getItem('appVersion')) {
      this.storageService.clear();
      this.storageService.setItem(StorageKeys.APP_VERSION, environment.appVersion);
    }
  }
}
